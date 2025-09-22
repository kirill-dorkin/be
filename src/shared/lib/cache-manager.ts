interface CacheConfig {
  ttl: number; // Time to live in seconds
  staleWhileRevalidate?: number; // SWR time in seconds
  tags?: string[];
  version?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  staleWhileRevalidate?: number;
  tags?: string[];
  version?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0
  };

  // Get item from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    const age = (now - entry.timestamp) / 1000;

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      this.stats.deletes++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  // Set item in cache
  set<T>(key: string, data: T, config: CacheConfig): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      staleWhileRevalidate: config.staleWhileRevalidate,
      tags: config.tags,
      version: config.version
    };

    this.cache.set(key, entry);
    this.stats.sets++;
    this.stats.size = this.cache.size;
  }

  // Check if item is stale but still usable (SWR)
  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    const age = (now - entry.timestamp) / 1000;
    
    return age > entry.ttl && Boolean(entry.staleWhileRevalidate) && age <= entry.ttl + (entry.staleWhileRevalidate || 0);
  }

  // Get stale data for SWR
  getStale<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;

    const now = Date.now();
    const age = (now - entry.timestamp) / 1000;

    // Return stale data if within SWR window
    if (entry.staleWhileRevalidate && age <= entry.ttl + entry.staleWhileRevalidate) {
      return entry.data;
    }

    return null;
  }

  // Delete item from cache
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  // Clear cache by tags
  clearByTags(tags: string[]): number {
    let cleared = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        cleared++;
      }
    }

    this.stats.deletes += cleared;
    this.stats.size = this.cache.size;
    return cleared;
  }

  // Clear cache by version
  clearByVersion(version: string): number {
    let cleared = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.version && entry.version !== version) {
        this.cache.delete(key);
        cleared++;
      }
    }

    this.stats.deletes += cleared;
    this.stats.size = this.cache.size;
    return cleared;
  }

  // Clear all cache
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
    this.stats.size = 0;
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Get cache hit rate
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  // Cleanup expired entries
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const age = (now - entry.timestamp) / 1000;
      
      // Remove if expired and no SWR
      if (age > entry.ttl && (!entry.staleWhileRevalidate || age > entry.ttl + entry.staleWhileRevalidate)) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    this.stats.deletes += cleaned;
    this.stats.size = this.cache.size;
    return cleaned;
  }

  // Get all keys
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
export const cacheManager = new CacheManager();

// Cache decorator for functions
export function cached<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  config: CacheConfig & { keyGenerator?: (...args: T) => string }
) {
  return async (...args: T): Promise<R> => {
    const key = config.keyGenerator ? config.keyGenerator(...args) : JSON.stringify(args);
    
    // Try to get from cache
    const cached = cacheManager.get<R>(key);
    if (cached !== null) {
      return cached;
    }

    // Check for stale data
    const stale = cacheManager.getStale<R>(key);
    if (stale !== null) {
      // Return stale data and revalidate in background
      fn(...args).then(result => {
        cacheManager.set(key, result, config);
      }).catch(() => {
        // Ignore revalidation errors
      });
      return stale;
    }

    // Fetch fresh data
    const result = await fn(...args);
    cacheManager.set(key, result, config);
    return result;
  };
}

// React hook for cache management
export function useCache() {
  const get = <T>(key: string): T | null => cacheManager.get<T>(key);
  const set = <T>(key: string, data: T, config: CacheConfig): void => cacheManager.set(key, data, config);
  const del = (key: string): boolean => cacheManager.delete(key);
  const clear = (): void => cacheManager.clear();
  const clearByTags = (tags: string[]): number => cacheManager.clearByTags(tags);
  const getStats = (): CacheStats => cacheManager.getStats();
  const getHitRate = (): number => cacheManager.getHitRate();

  return {
    get,
    set,
    delete: del,
    clear,
    clearByTags,
    getStats,
    getHitRate
  };
}

// Automatic cleanup interval
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup();
  }, 60000); // Cleanup every minute
}

export default cacheManager;