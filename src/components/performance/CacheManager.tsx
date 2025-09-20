'use client';

import React, { useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  lastModified?: string;
  stale: boolean;
  revalidating: boolean;
  size: number;
}

interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  defaultTtl: number; // Default TTL in milliseconds
  staleWhileRevalidate: number; // SWR time in milliseconds
  maxEntries: number; // Maximum number of cache entries
  enableCompression: boolean;
  enablePersistence: boolean;
  persistenceKey: string;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  revalidations: number;
  totalSize: number;
  entryCount: number;
  hitRate: number;
}

// interface RevalidationStrategy {
//   type: 'time' | 'mutation' | 'focus' | 'network';
//   interval?: number;
//   dependencies?: string[];
// }

// Advanced cache manager with ISR capabilities
class AdvancedCacheManager {
  private static instance: AdvancedCacheManager;
  private cache = new Map<string, CacheEntry<unknown>>();
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private revalidationQueue = new Set<string>();
  private compressionWorker?: Worker;
  private persistenceTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB
      defaultTtl: 5 * 60 * 1000, // 5 minutes
      staleWhileRevalidate: 60 * 1000, // 1 minute
      maxEntries: 1000,
      enableCompression: true,
      enablePersistence: true,
      persistenceKey: 'app-cache-v1',
      ...config
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      revalidations: 0,
      totalSize: 0,
      entryCount: 0,
      hitRate: 0
    };

    this.initializeCompression();
    this.loadFromPersistence();
    this.setupPersistence();
  }

  static getInstance(config?: Partial<CacheConfig>): AdvancedCacheManager {
    if (!AdvancedCacheManager.instance) {
      AdvancedCacheManager.instance = new AdvancedCacheManager(config);
    }
    return AdvancedCacheManager.instance;
  }

  private initializeCompression(): void {
    if (!this.config.enableCompression || typeof Worker === 'undefined') return;

    try {
      // Create compression worker for large data
      const workerCode = `
        self.onmessage = function(e) {
          const { id, data, action } = e.data;
          
          if (action === 'compress') {
            try {
              const compressed = JSON.stringify(data);
              self.postMessage({ id, result: compressed, success: true });
            } catch (error) {
              self.postMessage({ id, error: error.message, success: false });
            }
          } else if (action === 'decompress') {
            try {
              const decompressed = JSON.parse(data);
              self.postMessage({ id, result: decompressed, success: true });
            } catch (error) {
              self.postMessage({ id, error: error.message, success: false });
            }
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.compressionWorker = new Worker(URL.createObjectURL(blob));
    } catch (error) {
      console.warn('Failed to initialize compression worker:', error);
    }
  }

  private calculateSize(data: unknown): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  private evictLRU(): void {
    if (this.cache.size === 0) return;

    // Find least recently used entry
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      if (entry) {
        this.metrics.totalSize -= entry.size;
        this.metrics.evictions++;
      }
      this.cache.delete(oldestKey);
    }
  }

  private shouldEvict(): boolean {
    return (
      this.cache.size >= this.config.maxEntries ||
      this.metrics.totalSize >= this.config.maxSize
    );
  }

  async set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      etag?: string;
      lastModified?: string;
      tags?: string[];
    } = {}
  ): Promise<void> {
    const size = this.calculateSize(data);
    const ttl = options.ttl || this.config.defaultTtl;

    // Evict if necessary
    while (this.shouldEvict()) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      etag: options.etag,
      lastModified: options.lastModified,
      stale: false,
      revalidating: false,
      size
    };

    // Remove old entry size from metrics
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.metrics.totalSize -= oldEntry.size;
    } else {
      this.metrics.entryCount++;
    }

    this.cache.set(key, entry);
    this.metrics.totalSize += size;

    // Trigger persistence
    this.schedulePersistence();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if entry is expired
    if (age > entry.ttl) {
      // Check if we can serve stale while revalidating
      if (age <= entry.ttl + this.config.staleWhileRevalidate) {
        entry.stale = true;
        this.scheduleRevalidation(key);
        this.metrics.hits++;
        this.updateHitRate();
        return entry.data;
      } else {
        // Entry is too old, remove it
        this.delete(key);
        this.metrics.misses++;
        this.updateHitRate();
        return null;
      }
    }

    // Update timestamp for LRU
    entry.timestamp = now;
    this.metrics.hits++;
    this.updateHitRate();
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    return age <= entry.ttl + this.config.staleWhileRevalidate;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.metrics.totalSize -= entry.size;
      this.metrics.entryCount--;
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.metrics.totalSize = 0;
    this.metrics.entryCount = 0;
    this.metrics.evictions = 0;
  }

  private scheduleRevalidation(key: string): void {
    if (this.revalidationQueue.has(key)) return;

    this.revalidationQueue.add(key);
    
    // Revalidate in next tick
    setTimeout(() => {
      this.revalidate(key);
    }, 0);
  }

  private async revalidate(key: string): Promise<void> {
    const entry = this.cache.get(key);
    if (!entry || entry.revalidating) return;

    entry.revalidating = true;
    this.metrics.revalidations++;

    try {
      // Emit revalidation event for external handling
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cache-revalidate', {
          detail: { key, entry }
        }));
      }
    } catch (error) {
      console.warn('Cache revalidation failed for key:', key, error);
    } finally {
      entry.revalidating = false;
      this.revalidationQueue.delete(key);
    }
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  // Persistence methods
  private loadFromPersistence(): void {
    if (!this.config.enablePersistence || typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.config.persistenceKey);
      if (stored) {
        const { cache, metrics } = JSON.parse(stored);
        
        // Restore cache entries
        for (const [key, entryData] of Object.entries(cache)) {
          this.cache.set(key, entryData as CacheEntry);
        }
        
        // Restore metrics
        this.metrics = { ...this.metrics, ...metrics };
      }
    } catch (error) {
      console.warn('Failed to load cache from persistence:', error);
    }
  }

  private schedulePersistence(): void {
    if (!this.config.enablePersistence) return;

    if (this.persistenceTimer) {
      clearTimeout(this.persistenceTimer);
    }

    this.persistenceTimer = setTimeout(() => {
      this.saveToPersistence();
    }, 1000); // Debounce saves
  }

  private saveToPersistence(): void {
    if (!this.config.enablePersistence || typeof localStorage === 'undefined') return;

    try {
      const cacheObject = Object.fromEntries(this.cache.entries());
      const data = {
        cache: cacheObject,
        metrics: this.metrics,
        timestamp: Date.now()
      };

      localStorage.setItem(this.config.persistenceKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to persistence:', error);
    }
  }

  private setupPersistence(): void {
    if (!this.config.enablePersistence || typeof window === 'undefined') return;

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveToPersistence();
    });

    // Periodic saves
    setInterval(() => {
      this.saveToPersistence();
    }, 30000); // Save every 30 seconds
  }

  // Tag-based invalidation
  invalidateByTag(tag: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache.entries()) {
      // Check if key contains the tag
      if (key.includes(tag)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  // Cleanup
  cleanup(): void {
    if (this.compressionWorker) {
      this.compressionWorker.terminate();
    }
    
    if (this.persistenceTimer) {
      clearTimeout(this.persistenceTimer);
    }
    
    this.saveToPersistence();
  }
}

// React hook for cache management
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    refreshInterval?: number;
  } = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const cache = AdvancedCacheManager.getInstance();
  const fetcherRef = useRef(fetcher);
  
  fetcherRef.current = fetcher;

  const fetchData = useCallback(async (force = false) => {
    if (!force) {
      const cached = cache.get<T>(key);
      if (cached) {
        setData(cached);
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current();
      await cache.set(key, result, { ttl: options.ttl });
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, cache, options.ttl]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Revalidate on focus
  useEffect(() => {
    if (!options.revalidateOnFocus) return;

    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, options.revalidateOnFocus]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!options.revalidateOnReconnect) return;

    const handleOnline = () => fetchData();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [fetchData, options.revalidateOnReconnect]);

  // Refresh interval
  useEffect(() => {
    if (!options.refreshInterval) return;

    const interval = setInterval(() => fetchData(), options.refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, options.refreshInterval]);

  // Listen for cache revalidation events
  useEffect(() => {
    const handleRevalidate = (event: CustomEvent) => {
      if (event.detail.key === key) {
        fetchData(true);
      }
    };

    window.addEventListener('cache-revalidate', handleRevalidate as EventListener);
    return () => window.removeEventListener('cache-revalidate', handleRevalidate as EventListener);
  }, [key, fetchData]);

  const mutate = useCallback(async (newData?: T) => {
    if (newData) {
      await cache.set(key, newData, { ttl: options.ttl });
      setData(newData);
    } else {
      return fetchData(true);
    }
  }, [key, cache, options.ttl, fetchData]);

  return {
    data,
    loading,
    error,
    mutate,
    revalidate: () => fetchData(true)
  };
}

// Cache provider component
interface CacheProviderProps {
  children: React.ReactNode;
  config?: Partial<CacheConfig>;
}

export const CacheProvider: React.FC<CacheProviderProps> = ({ 
  children, 
  config 
}) => {
  const cacheRef = useRef<AdvancedCacheManager>();

  useEffect(() => {
    cacheRef.current = AdvancedCacheManager.getInstance(config);
    
    return () => {
      cacheRef.current?.cleanup();
    };
  }, [config]);

  return <>{children}</>;
};

// Cache metrics hook
export function useCacheMetrics() {
  const [metrics, setMetrics] = React.useState<CacheMetrics>(() => 
    AdvancedCacheManager.getInstance().getMetrics()
  );

  useEffect(() => {
    const cache = AdvancedCacheManager.getInstance();
    
    const interval = setInterval(() => {
      setMetrics(cache.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// ISR helper for static content
export function useISR<T>(
  key: string,
  staticData: T,
  revalidate: number = 60 // seconds
) {
  const cache = AdvancedCacheManager.getInstance();
  
  useEffect(() => {
    // Set static data with ISR revalidation
    cache.set(key, staticData, { 
      ttl: revalidate * 1000,
    });
  }, [key, staticData, revalidate, cache]);

  return cache.get<T>(key) || staticData;
}

export default AdvancedCacheManager;