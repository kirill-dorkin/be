'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

interface ISRConfig {
  revalidate: number;
  fallback: boolean;
  tags: string[];
}

interface AdvancedCacheConfig {
  maxSize: number; // в байтах
  defaultTTL: number;
  enableCompression: boolean;
  enablePersistence: boolean;
  strategy: 'lru' | 'lfu' | 'fifo';
}

interface ExtendedCacheMetrics extends CacheMetrics {
  totalSize: number;
  entryCount: number;
  averageResponseTime: number;
  evictionCount: number;
}

interface ISRManagerConfig {
  defaultRevalidate: number;
  maxCacheSize: number;
  enableBackgroundRevalidation: boolean;
  staleWhileRevalidate: boolean;
  retryAttempts: number;
  retryDelay: number;
}

class CachePerformanceMonitor {
  private static instance: CachePerformanceMonitor;
  private cache = new Map<string, CacheEntry>();
  private accessCount = new Map<string, number>();
  private accessOrder: string[] = [];
  private config: AdvancedCacheConfig = {
    maxSize: 50 * 1024 * 1024, // 50MB
    defaultTTL: 300000,
    enableCompression: true,
    enablePersistence: true,
    strategy: 'lru'
  };
  private metrics: ExtendedCacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
    totalSize: 0,
    entryCount: 0,
    averageResponseTime: 0,
    evictionCount: 0
  };
  private responseTimes: number[] = [];
  private observers: ((metrics: ExtendedCacheMetrics) => void)[] = [];

  static getInstance(): CachePerformanceMonitor {
    if (!CachePerformanceMonitor.instance) {
      CachePerformanceMonitor.instance = new CachePerformanceMonitor();
    }
    return CachePerformanceMonitor.instance;
  }

  static createISRManager(config?: Partial<ISRManagerConfig>): ISRManager {
    return new ISRManager(config);
  }

  set<T>(key: string, data: T, ttl: number = 300000, tags: string[] = [], priority: 'low' | 'medium' | 'high' = 'medium'): void {
    const startTime = performance.now();
    
    const entrySize = this.calculateSize(data);
    this.ensureCapacity(entrySize);
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
      priority
    };
    
    this.cache.set(key, entry);
    this.updateAccessStats(key);
    this.updateMetrics();
    
    const responseTime = performance.now() - startTime;
    this.updateResponseTime(responseTime);
    
    if (this.config.enablePersistence) {
      this.saveToPersistence();
    }
  }

  get<T>(key: string): T | null {
    const startTime = performance.now();
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      this.metrics.misses++;
      this.updateMetrics();
      return null;
    }
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.metrics.misses++;
      this.updateMetrics();
      return null;
    }
    
    this.metrics.hits++;
    this.updateAccessStats(key);
    this.updateMetrics();
    
    const responseTime = performance.now() - startTime;
    this.updateResponseTime(responseTime);
    
    return entry.data;
  }

  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        this.accessCount.delete(key);
      }
    }
    this.updateMetrics();
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.accessCount.delete(key);
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      this.updateMetrics();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.accessCount.clear();
    this.accessOrder = [];
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
      totalSize: 0,
      entryCount: 0,
      averageResponseTime: 0,
      evictionCount: 0
    };
    this.responseTimes = [];
    this.updateMetrics();
  }

  getMetrics(): ExtendedCacheMetrics {
    return { ...this.metrics };
  }

  getConfig(): AdvancedCacheConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<AdvancedCacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  async preload<T>(key: string, dataLoader: () => Promise<T>, options?: { ttl?: number; tags?: string[]; priority?: 'low' | 'medium' | 'high' }): Promise<void> {
    try {
      const data = await dataLoader();
      this.set<T>(key, data, options?.ttl, options?.tags, options?.priority);
    } catch (error) {
      console.error(`Failed to preload cache key ${key}:`, error);
    }
  }

  async warmup(keys: Array<{ key: string; loader: () => Promise<unknown>; options?: { ttl?: number; tags?: string[]; priority?: 'low' | 'medium' | 'high' } }>): Promise<void[]> {
    return Promise.all(keys.map(({ key, loader, options }) => 
      this.preload(key, loader, options)
    ));
  }

  getTopKeys(limit: number = 10): Array<{ key: string; accessCount: number }> {
    return Array.from(this.accessCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([key, accessCount]) => ({ key, accessCount }));
  }

  exportCache(): string {
    const exportData = {
      cache: Array.from(this.cache.entries()),
      accessCount: Array.from(this.accessCount.entries()),
      metrics: this.metrics
    };
    return JSON.stringify(exportData);
  }

  importCache(data: string): void {
    try {
      const importData = JSON.parse(data);
      this.cache = new Map(importData.cache);
      this.accessCount = new Map(importData.accessCount);
      this.metrics = importData.metrics;
      this.updateMetrics();
    } catch (error) {
      console.error('Failed to import cache:', error);
    }
  }

  private calculateSize(data: unknown): number {
    return JSON.stringify(data).length * 2; // Приблизительный размер в байтах
  }

  private ensureCapacity(newEntrySize: number): void {
    while (this.metrics.totalSize + newEntrySize > this.config.maxSize && this.cache.size > 0) {
      this.evictEntry();
    }
  }

  private evictEntry(): void {
    let keyToEvict: string | null = null;
    
    switch (this.config.strategy) {
      case 'lru':
        keyToEvict = this.accessOrder[0] || null;
        break;
      case 'lfu':
        keyToEvict = this.findLFUKey();
        break;
      case 'fifo':
        keyToEvict = this.cache.keys().next().value || null;
        break;
    }
    
    if (keyToEvict) {
      this.cache.delete(keyToEvict);
      this.accessCount.delete(keyToEvict);
      this.accessOrder = this.accessOrder.filter(k => k !== keyToEvict);
      this.metrics.evictions++;
      this.metrics.evictionCount++;
    }
  }

  private findLFUKey(): string | null {
    let minCount = Infinity;
    let lfuKey: string | null = null;
    
    for (const [key, count] of this.accessCount.entries()) {
      if (count < minCount) {
        minCount = count;
        lfuKey = key;
      }
    }
    
    return lfuKey;
  }

  private updateAccessStats(key: string): void {
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    
    // Обновляем порядок доступа для LRU
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  private updateResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
  }

  private saveToPersistence(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cacheData = {
          cache: Array.from(this.cache.entries()),
          accessCount: Array.from(this.accessCount.entries()),
          timestamp: Date.now()
        };
        localStorage.setItem('cache-performance-monitor', JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error('Failed to save cache to persistence:', error);
    }
  }

  private loadFromPersistence(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('cache-performance-monitor');
        if (stored) {
          const cacheData = JSON.parse(stored);
          this.cache = new Map(cacheData.cache);
          this.accessCount = new Map(cacheData.accessCount);
        }
      }
    } catch (error) {
      console.error('Failed to load cache from persistence:', error);
    }
  }

  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.accessCount.delete(oldestKey);
        this.metrics.evictions++;
        this.metrics.evictionCount++;
      }
    }
  }

  private updateMetrics(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
    this.metrics.size = this.cache.size;
    this.metrics.entryCount = this.cache.size;
    
    // Вычисляем общий размер
    this.metrics.totalSize = Array.from(this.cache.values())
      .reduce((total, entry) => total + this.calculateSize(entry.data), 0);
    
    // Вычисляем среднее время ответа
    if (this.responseTimes.length > 0) {
      this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    }
    
    // Уведомляем наблюдателей
    this.observers.forEach(observer => observer(this.metrics));
  }

  subscribe(observer: (metrics: ExtendedCacheMetrics) => void): () => void {
    this.observers.push(observer);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }


}

class ISRManager {
  private cache = new Map<string, { 
    data: unknown; 
    timestamp: number; 
    revalidateAt: number; 
    tags: string[];
    priority: 'low' | 'medium' | 'high';
    accessCount: number;
  }>();
  private revalidationQueue = new Set<string>();
  private config: ISRManagerConfig;

  constructor(config?: Partial<ISRManagerConfig>) {
    this.config = {
      defaultRevalidate: 60000, // 1 минута
      maxCacheSize: 1000,
      enableBackgroundRevalidation: true,
      staleWhileRevalidate: true,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
  }

  async get<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    options?: {
      revalidate?: number;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high';
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    const revalidateTime = options?.revalidate || this.config.defaultRevalidate;
    const now = Date.now();
    const cached = this.cache.get(key);

    // Принудительное обновление
    if (options?.forceRefresh) {
      return this.fetchAndCache(key, fetcher, revalidateTime, options);
    }

    // Если данных нет в кэше
    if (!cached) {
      return this.fetchAndCache(key, fetcher, revalidateTime, options);
    }

    // Обновляем статистику доступа
    cached.accessCount++;

    // Если данные устарели
    if (now > cached.revalidateAt) {
      if (this.config.staleWhileRevalidate) {
        // Возвращаем устаревшие данные и запускаем фоновое обновление
        this.revalidateInBackground(key, fetcher, revalidateTime, options);
        return cached.data as T;
      } else {
        // Синхронно обновляем данные
        return this.fetchAndCache(key, fetcher, revalidateTime, options);
      }
    }

    return cached.data as T;
  }

  private async fetchAndCache<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    revalidateTime: number,
    options?: { tags?: string[]; priority?: 'low' | 'medium' | 'high' }
  ): Promise<T> {
    try {
      const data = await this.retryFetch(fetcher);
      const now = Date.now();
      
      this.cache.set(key, {
        data,
        timestamp: now,
        revalidateAt: now + revalidateTime,
        tags: options?.tags || [],
        priority: options?.priority || 'medium',
        accessCount: 1
      });

      this.ensureCacheCapacity();
      return data;
    } catch (error) {
      console.error(`Failed to fetch data for key ${key}:`, error);
      throw error;
    }
  }

  private async retryFetch<T>(fetcher: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await fetcher();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retryAttempts) {
          // Экспоненциальная задержка с джиттером
          const delay = this.config.retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  private async revalidateInBackground<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    revalidateTime: number,
    options?: { tags?: string[]; priority?: 'low' | 'medium' | 'high' }
  ): Promise<void> {
    if (this.revalidationQueue.has(key)) {
      return; // Уже обновляется
    }

    this.revalidationQueue.add(key);
    
    try {
      await this.fetchAndCache(key, fetcher, revalidateTime, options);
    } catch (error) {
      console.error(`Background revalidation failed for key ${key}:`, error);
    } finally {
      this.revalidationQueue.delete(key);
    }
  }

  private ensureCacheCapacity(): void {
    while (this.cache.size > this.config.maxCacheSize) {
      // Удаляем наименее используемые записи
      let leastUsedKey: string | null = null;
      let minAccessCount = Infinity;
      let oldestTimestamp = Infinity;

      for (const [key, entry] of this.cache.entries()) {
        if (entry.accessCount < minAccessCount || 
           (entry.accessCount === minAccessCount && entry.timestamp < oldestTimestamp)) {
          minAccessCount = entry.accessCount;
          oldestTimestamp = entry.timestamp;
          leastUsedKey = key;
        }
      }

      if (leastUsedKey) {
        this.cache.delete(leastUsedKey);
      } else {
        break;
      }
    }
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.revalidationQueue.delete(key);
  }

  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        this.revalidationQueue.delete(key);
      }
    }
  }

  invalidateAll(): void {
    this.cache.clear();
    this.revalidationQueue.clear();
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      revalidationQueueSize: this.revalidationQueue.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        revalidateAt: entry.revalidateAt,
        tags: entry.tags,
        priority: entry.priority,
        accessCount: entry.accessCount,
        isStale: Date.now() > entry.revalidateAt
      }))
    };
  }

  updateConfig(newConfig: Partial<ISRManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

interface CachedDataProps<T> {
  cacheKey: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  fallback?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}

export function CachedData<T>({
  cacheKey,
  fetcher,
  ttl = 300000,
  tags = [],
  priority = 'medium',
  fallback = <div>Loading...</div>,
  children
}: CachedDataProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cacheManager = useRef(CachePerformanceMonitor.getInstance());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Проверяем кэш
        const cached = cacheManager.current.get<T>(cacheKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }
        
        // Загружаем данные
        const result = await fetcher();
        cacheManager.current.set(cacheKey, result, ttl, tags, priority);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [cacheKey, fetcher, ttl, tags, priority]);

  if (loading) return <>{fallback}</>;
  if (error) throw error;
  if (!data) return <>{fallback}</>;

  return <>{children(data)}</>;
}

interface ISRWrapperProps {
  config: ISRConfig;
  children: React.ReactNode;
  onRevalidate?: () => void;
}

export function ISRWrapper({ config, children, onRevalidate }: ISRWrapperProps) {
  const [isRevalidating, setIsRevalidating] = useState(false);
  const isrManager = useRef(CachePerformanceMonitor.createISRManager({
    defaultRevalidate: config.revalidate
  }));

  useEffect(() => {
    // Инициализируем ISR manager
    console.debug('ISR Manager initialized:', isrManager.current);
    
    const interval = setInterval(() => {
      if (onRevalidate) {
        setIsRevalidating(true);
        onRevalidate();
        setTimeout(() => setIsRevalidating(false), 1000);
      }
    }, config.revalidate);

    return () => clearInterval(interval);
  }, [config.revalidate, onRevalidate]);

  return (
    <div data-isr-revalidating={isRevalidating}>
      {children}
    </div>
  );
}

export function useCache() {
  const cacheManager = useRef(CachePerformanceMonitor.getInstance());
  
  const get = useCallback(<T,>(key: string): T | null => {
    return cacheManager.current.get<T>(key);
  }, []);
  
  const set = useCallback(<T,>(
    key: string, 
    data: T, 
    ttl?: number, 
    tags?: string[], 
    priority?: 'low' | 'medium' | 'high'
  ) => {
    cacheManager.current.set(key, data, ttl, tags, priority);
  }, []);
  
  const invalidate = useCallback((key: string) => {
    cacheManager.current.delete(key);
  }, []);
  
  const invalidateByTag = useCallback((tag: string) => {
    cacheManager.current.invalidateByTag(tag);
  }, []);
  
  return { get, set, invalidate, invalidateByTag };
}

export function useCacheMetrics() {
  const [metrics, setMetrics] = useState<ExtendedCacheMetrics>({
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
    totalSize: 0,
    entryCount: 0,
    averageResponseTime: 0,
    evictionCount: 0
  });
  
  const cacheManager = useRef(CachePerformanceMonitor.getInstance());
  
  useEffect(() => {
    const unsubscribe = cacheManager.current.subscribe(setMetrics);
    return unsubscribe;
  }, []);
  
  return metrics;
}

export function CacheMetrics() {
  const metrics = useCacheMetrics();
  
  return (
    <div className="cache-metrics">
      <h3>Cache Performance</h3>
      <div className="metrics-grid">
        <div>Hit Rate: {(metrics.hitRate * 100).toFixed(2)}%</div>
        <div>Hits: {metrics.hits}</div>
        <div>Misses: {metrics.misses}</div>
        <div>Size: {metrics.size} entries</div>
        <div>Total Size: {(metrics.totalSize / 1024).toFixed(2)} KB</div>
        <div>Evictions: {metrics.evictions}</div>
        <div>Avg Response Time: {metrics.averageResponseTime.toFixed(2)}ms</div>
      </div>
    </div>
  );
}

export function withCache<P extends object>(
  Component: React.ComponentType<P>,
  cacheKey: (props: P) => string,
  ttl: number = 300000
) {
  return function CachedComponent(props: P) {
    const key = cacheKey(props);
    
    return (
      <CachedData
        cacheKey={key}
        fetcher={async () => props}
        ttl={ttl}
      >
        {(cachedProps) => <Component {...cachedProps} />}
      </CachedData>
    );
  };
}

export const useCacheOptimizer = (config?: { 
  cache?: AdvancedCacheConfig; 
  isr?: Partial<ISRManagerConfig> 
}) => {
  const [cacheManager] = useState(() => CachePerformanceMonitor.getInstance());
  const [isrManager] = useState(() => new ISRManager(config?.isr));
  const [metrics, setMetrics] = useState<ExtendedCacheMetrics>({
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
    evictions: 0,
    totalSize: 0,
    entryCount: 0,
    averageResponseTime: 0,
    evictionCount: 0
  });

  useEffect(() => {
    const unsubscribe = cacheManager.subscribe(setMetrics);
    return unsubscribe;
  }, [cacheManager]);

  useEffect(() => {
    if (config?.cache) {
      cacheManager.updateConfig(config.cache);
    }
  }, [cacheManager, config?.cache]);

  const preloadData = useCallback(async <T,>(
    key: string,
    dataLoader: () => Promise<T>,
    options?: { ttl?: number; tags?: string[]; priority?: 'low' | 'medium' | 'high' }
  ) => {
    return cacheManager.preload(key, dataLoader, options);
  }, [cacheManager]);

  const warmupCache = useCallback(async (
    keys: Array<{ key: string; loader: () => Promise<unknown>; options?: { ttl?: number; tags?: string[]; priority?: 'low' | 'medium' | 'high' } }>
  ) => {
    return cacheManager.warmup(keys);
  }, [cacheManager]);

  const getISRData = useCallback(async <T,>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      revalidate?: number;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high';
      forceRefresh?: boolean;
    }
  ) => {
    return isrManager.get(key, fetcher, options);
  }, [isrManager]);

  const invalidateByTag = useCallback((tag: string) => {
    cacheManager.invalidateByTag(tag);
    isrManager.invalidateByTag(tag);
  }, [cacheManager, isrManager]);

  const getTopKeys = useCallback((limit?: number) => {
    return cacheManager.getTopKeys(limit);
  }, [cacheManager]);

  const exportCache = useCallback(() => {
    return {
      cache: cacheManager.exportCache(),
      isr: isrManager.getStats()
    };
  }, [cacheManager, isrManager]);

  return {
    cache: cacheManager,
    isr: isrManager,
    metrics,
    preloadData,
    warmupCache,
    getISRData,
    invalidateByTag,
    getTopKeys,
    exportCache
  };
};

export default CachePerformanceMonitor;