import { unstable_cache } from 'next/cache';

// Типы для кэширования
export interface CacheConfig {
  revalidate?: number;
  tags?: string[];
}

// Агрессивное кэширование для статических данных
export const cacheStatic = <T extends Array<string | number | boolean>, R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  config: CacheConfig = {}
) => {
  return unstable_cache(
    fn,
    keyParts,
    {
      revalidate: config.revalidate || 3600, // 1 час по умолчанию
      tags: config.tags || [],
    }
  );
};

// Кэширование для динамических данных
export const cacheDynamic = <T extends Array<string | number | boolean>, R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  config: CacheConfig = {}
) => {
  return unstable_cache(
    fn,
    keyParts,
    {
      revalidate: config.revalidate || 300, // 5 минут по умолчанию
      tags: config.tags || [],
    }
  );
};

// Кэширование для пользовательских данных
export const cacheUser = <T extends Array<string | number | boolean>, R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  config: CacheConfig = {}
) => {
  return unstable_cache(
    fn,
    keyParts,
    {
      revalidate: config.revalidate || 60, // 1 минута по умолчанию
      tags: config.tags || [],
    }
  );
};

// Утилиты для работы с тегами кэша
export const CACHE_TAGS = {
  TASKS: 'tasks',
  USERS: 'users',
  CATEGORIES: 'categories',
  DEVICES: 'devices',
  SERVICES: 'services',
  DASHBOARD: 'dashboard',
} as const;

// Функция для инвалидации кэша по тегам
export const invalidateCache = async (tags: string[]) => {
  if (typeof window === 'undefined') {
    const { revalidateTag } = await import('next/cache');
    tags.forEach(tag => revalidateTag(tag));
  }
};

// Функция для инвалидации кэша по пути
export const invalidatePath = async (path: string) => {
  if (typeof window === 'undefined') {
    const { revalidatePath } = await import('next/cache');
    revalidatePath(path);
  }
};

// Мемоизация для клиентской стороны
export class ClientCache {
  private cache = new Map<string, { data: Record<string, string | number | boolean>; timestamp: number; ttl: number }>();

  set(key: string, data: Record<string, string | number | boolean>, ttl: number = 300000) { // 5 минут по умолчанию
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  // Очистка устаревших записей
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Глобальный экземпляр клиентского кэша
export const clientCache = new ClientCache();

// Автоматическая очистка каждые 5 минут
if (typeof window !== 'undefined') {
  setInterval(() => {
    clientCache.cleanup();
  }, 300000);
}