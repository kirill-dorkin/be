import { connectToDatabase } from './dbConnect';
import mongoose from 'mongoose';
import { Redis } from 'ioredis';

// Конфигурация Redis для кэширования
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

// Интерфейс для опций кэширования
interface CacheOptions {
  ttl?: number; // время жизни в секундах
  prefix?: string;
  skipCache?: boolean;
}

// Интерфейс для опций пагинации
interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Интерфейс для результата пагинации
interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Класс для оптимизированной работы с БД
export class OptimizedDbService {
  private static instance: OptimizedDbService;
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 300; // 5 минут
  private readonly MAX_CACHE_SIZE = 1000;

  private constructor() {
    // Очистка кэша каждые 10 минут
    setInterval(() => this.cleanupCache(), 10 * 60 * 1000);
  }

  public static getInstance(): OptimizedDbService {
    if (!OptimizedDbService.instance) {
      OptimizedDbService.instance = new OptimizedDbService();
    }
    return OptimizedDbService.instance;
  }

  // Генерация ключа кэша
  private generateCacheKey(model: string, query: any, options?: any): string {
    const queryStr = JSON.stringify({ query, options });
    return `${model}:${Buffer.from(queryStr).toString('base64')}`;
  }

  // Очистка устаревшего кэша
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.queryCache.entries()) {
      if (now - value.timestamp > value.ttl * 1000) {
        this.queryCache.delete(key);
      }
    }

    // Ограничиваем размер кэша
    if (this.queryCache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.queryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
      toDelete.forEach(([key]) => this.queryCache.delete(key));
    }
  }

  // Получение данных из кэша
  private async getFromCache(key: string): Promise<any | null> {
    try {
      // Сначала проверяем локальный кэш
      const localCache = this.queryCache.get(key);
      if (localCache && Date.now() - localCache.timestamp < localCache.ttl * 1000) {
        return localCache.data;
      }

      // Затем проверяем Redis
      if (redis.status === 'ready') {
        const cached = await redis.get(key);
        if (cached) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.warn('Cache get error:', error);
    }
    return null;
  }

  // Сохранение данных в кэш
  private async setCache(key: string, data: any, ttl: number): Promise<void> {
    try {
      // Сохраняем в локальный кэш
      this.queryCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });

      // Сохраняем в Redis
      if (redis.status === 'ready') {
        await redis.setex(key, ttl, JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  // Очистка кэша по паттерну
  public async clearCache(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        // Очищаем локальный кэш
        for (const key of this.queryCache.keys()) {
          if (key.includes(pattern)) {
            this.queryCache.delete(key);
          }
        }

        // Очищаем Redis
        if (redis.status === 'ready') {
          const keys = await redis.keys(`*${pattern}*`);
          if (keys.length > 0) {
            await redis.del(...keys);
          }
        }
      } else {
        this.queryCache.clear();
        if (redis.status === 'ready') {
          await redis.flushdb();
        }
      }
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  // Оптимизированный поиск с кэшированием
  public async findWithCache<T>(
    model: mongoose.Model<T>,
    query: any = {},
    options: CacheOptions & { select?: string; populate?: string } = {}
  ): Promise<T[]> {
    await connectToDatabase();

    const { ttl = this.DEFAULT_TTL, prefix = '', skipCache = false, select, populate } = options;
    const cacheKey = `${prefix}${this.generateCacheKey(model.modelName, query, { select, populate })}`;

    if (!skipCache) {
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    let queryBuilder = model.find(query);
    
    if (select) {
      queryBuilder = queryBuilder.select(select);
    }
    
    if (populate) {
      queryBuilder = queryBuilder.populate(populate);
    }

    const result = await queryBuilder.lean();
    
    if (!skipCache) {
      await this.setCache(cacheKey, result, ttl);
    }

    return result as T[];
  }

  // Оптимизированная пагинация с кэшированием
  public async findWithPagination<T>(
    model: mongoose.Model<T>,
    query: any = {},
    paginationOptions: PaginationOptions,
    cacheOptions: CacheOptions & { select?: string; populate?: string } = {}
  ): Promise<PaginatedResult<T>> {
    await connectToDatabase();

    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = paginationOptions;
    const { ttl = this.DEFAULT_TTL, prefix = '', skipCache = false, select, populate } = cacheOptions;
    
    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const cacheKey = `${prefix}${this.generateCacheKey(model.modelName, query, {
      page, limit, sort, select, populate
    })}`;

    if (!skipCache) {
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Выполняем запросы параллельно
    const [data, total] = await Promise.all([
      (() => {
        let queryBuilder = model.find(query)
          .sort(sortObj)
          .skip(skip)
          .limit(limit);
        
        if (select) {
          queryBuilder = queryBuilder.select(select);
        }
        
        if (populate) {
          queryBuilder = queryBuilder.populate(populate);
        }
        
        return queryBuilder.lean();
      })() as Promise<T[]>,
      model.countDocuments(query)
    ]);

    const pages = Math.ceil(total / limit);
    const result: PaginatedResult<T> = {
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    };

    if (!skipCache) {
      await this.setCache(cacheKey, result, ttl);
    }

    return result;
  }

  // Агрегация с кэшированием
  public async aggregateWithCache<T>(
    model: mongoose.Model<T>,
    pipeline: any[],
    options: CacheOptions = {}
  ): Promise<any[]> {
    await connectToDatabase();

    const { ttl = this.DEFAULT_TTL, prefix = '', skipCache = false } = options;
    const cacheKey = `${prefix}${this.generateCacheKey(model.modelName, { pipeline }, {})}`;

    if (!skipCache) {
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const result = await model.aggregate(pipeline);
    
    if (!skipCache) {
      await this.setCache(cacheKey, result, ttl);
    }

    return result;
  }

  // Создание индексов для оптимизации
  public async createOptimizedIndexes(): Promise<void> {
    await connectToDatabase();

    try {
      // Получаем все модели
      const models = mongoose.models;
      
      for (const [modelName, model] of Object.entries(models)) {
        console.log(`Creating indexes for ${modelName}...`);
        
        // Создаем составные индексы в зависимости от модели
        switch (modelName) {
          case 'Product':
            await model.collection.createIndex({ category: 1, price: 1 });
            await model.collection.createIndex({ inStock: 1, featured: 1 });
            await model.collection.createIndex({ brand: 1, category: 1 });
            await model.collection.createIndex({ name: 'text', description: 'text' });
            break;
            
          case 'Order':
            await model.collection.createIndex({ userId: 1, createdAt: -1 });
            await model.collection.createIndex({ orderStatus: 1, createdAt: -1 });
            await model.collection.createIndex({ totalAmount: 1 });
            break;
            
          case 'User':
            await model.collection.createIndex({ email: 1 }, { unique: true });
            await model.collection.createIndex({ role: 1 });
            await model.collection.createIndex({ lastLogin: -1 });
            break;
            
          case 'Task':
            await model.collection.createIndex({ status: 1, priority: 1 });
            await model.collection.createIndex({ assignedTo: 1, status: 1 });
            await model.collection.createIndex({ createdAt: -1 });
            break;
        }
      }
      
      console.log('Indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }

  // Статистика производительности
  public getPerformanceStats(): {
    cacheSize: number;
    cacheHitRate: number;
    redisStatus: string;
  } {
    return {
      cacheSize: this.queryCache.size,
      cacheHitRate: 0, // TODO: реализовать подсчет hit rate
      redisStatus: redis.status
    };
  }
}

// Экспортируем singleton instance
export const optimizedDb = OptimizedDbService.getInstance();

// Хелперы для быстрого использования
export const findWithCache = optimizedDb.findWithCache.bind(optimizedDb);
export const findWithPagination = optimizedDb.findWithPagination.bind(optimizedDb);
export const aggregateWithCache = optimizedDb.aggregateWithCache.bind(optimizedDb);
export const clearCache = optimizedDb.clearCache.bind(optimizedDb);
export const createOptimizedIndexes = optimizedDb.createOptimizedIndexes.bind(optimizedDb);