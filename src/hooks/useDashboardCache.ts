'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ITask } from '@/models/Task';
import { IUser } from '@/models/User';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  activeUsers: number;
  pendingTasks: number;
  totalActiveTasks?: number;
  totalPendingTasks?: number;
  totalInProgressTasks?: number;
  totalCompletedTasks?: number;
}

interface DashboardData {
  tasks: ITask[];
  users: IUser[];
  metrics: DashboardMetrics;
}

interface UseDashboardCacheOptions {
  cacheTimeout?: number; // в миллисекундах
  enablePrefetch?: boolean;
  enableBackgroundRefresh?: boolean;
}

const CACHE_KEYS = {
  TASKS: 'dashboard_tasks',
  USERS: 'dashboard_users',
  METRICS: 'dashboard_metrics',
  DASHBOARD_DATA: 'dashboard_data'
} as const;

const DEFAULT_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 минут
const BACKGROUND_REFRESH_INTERVAL = 30 * 1000; // 30 секунд

class DashboardCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private refreshTimers = new Map<string, NodeJS.Timeout>();

  set<T>(key: string, data: T, timeout: number = DEFAULT_CACHE_TIMEOUT): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + timeout
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    const timer = this.refreshTimers.get(key);
    if (timer) {
      clearInterval(timer);
      this.refreshTimers.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.refreshTimers.forEach(timer => clearInterval(timer));
    this.refreshTimers.clear();
  }

  setBackgroundRefresh<T>(key: string, refreshFn: () => Promise<T>, interval: number = BACKGROUND_REFRESH_INTERVAL): void {
    // Очищаем предыдущий таймер если есть
    const existingTimer = this.refreshTimers.get(key);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    const timer = setInterval(async () => {
      try {
        const data = await refreshFn();
        if (data) {
          this.set(key, data);
        }
      } catch (error) {
        console.warn(`Background refresh failed for ${key}:`, error);
      }
    }, interval);

    this.refreshTimers.set(key, timer);
  }
}

// Глобальный экземпляр кэша
const dashboardCache = new DashboardCache();

export const useDashboardCache = (options: UseDashboardCacheOptions = {}) => {
  const {
    cacheTimeout = DEFAULT_CACHE_TIMEOUT,
    enablePrefetch = true,
    enableBackgroundRefresh = true
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение данных с кэшированием
  const getCachedData = useCallback(async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    forceRefresh: boolean = false
  ): Promise<T> => {
    // Проверяем кэш если не принудительное обновление
    if (!forceRefresh && dashboardCache.has(key)) {
      const cachedData = dashboardCache.get<T>(key);
      if (cachedData) {
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchFn();
      dashboardCache.set(key, data, cacheTimeout);
      
      // Настраиваем фоновое обновление
      if (enableBackgroundRefresh) {
        dashboardCache.setBackgroundRefresh(key, fetchFn);
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cacheTimeout, enableBackgroundRefresh]);

  // Предзагрузка данных
  const prefetchData = useCallback(async <T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<void> => {
    if (!enablePrefetch || dashboardCache.has(key)) {
      return;
    }

    try {
      const data = await fetchFn();
      dashboardCache.set(key, data, cacheTimeout);
      
      if (enableBackgroundRefresh) {
        dashboardCache.setBackgroundRefresh(key, fetchFn);
      }
    } catch (error) {
      console.warn(`Prefetch failed for ${key}:`, error);
    }
  }, [enablePrefetch, cacheTimeout, enableBackgroundRefresh]);

  // Инвалидация кэша
  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      dashboardCache.invalidate(key);
    } else {
      dashboardCache.clear();
    }
  }, []);

  // Получение задач
  const getTasks = useCallback(async (page: number = 1, perPage: number = 10, forceRefresh: boolean = false) => {
    const key = `${CACHE_KEYS.TASKS}_${page}_${perPage}`;
    return getCachedData(key, async () => {
      const response = await fetch(`/api/tasks?page=${page}&perPage=${perPage}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    }, forceRefresh);
  }, [getCachedData]);

  // Получение пользователей
  const getUsers = useCallback(async (page: number = 1, perPage: number = 10, forceRefresh: boolean = false) => {
    const key = `${CACHE_KEYS.USERS}_${page}_${perPage}`;
    return getCachedData(key, async () => {
      const response = await fetch(`/api/users?page=${page}&perPage=${perPage}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }, forceRefresh);
  }, [getCachedData]);

  // Получение метрик
  const getMetrics = useCallback(async (forceRefresh: boolean = false) => {
    return getCachedData(CACHE_KEYS.METRICS, async () => {
      const response = await fetch('/api/dashboard/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    }, forceRefresh);
  }, [getCachedData]);

  // Предзагрузка всех данных Dashboard
  const prefetchDashboardData = useCallback(async () => {
    if (!enablePrefetch) return;

    const prefetchPromises = [
      prefetchData(`${CACHE_KEYS.TASKS}_1_10`, async () => {
        const response = await fetch('/api/tasks?page=1&perPage=10');
        return response.ok ? response.json() : null;
      }),
      prefetchData(`${CACHE_KEYS.USERS}_1_10`, async () => {
        const response = await fetch('/api/users?page=1&perPage=10');
        return response.ok ? response.json() : null;
      }),
      prefetchData(CACHE_KEYS.METRICS, async () => {
        const response = await fetch('/api/dashboard/metrics');
        return response.ok ? response.json() : null;
      })
    ];

    await Promise.allSettled(prefetchPromises);
  }, [enablePrefetch, prefetchData]);

  // Проверка наличия данных в кэше
  const hasCachedData = useCallback((key: string) => {
    return dashboardCache.has(key);
  }, []);

  // Получение данных из кэша без запроса
  const getCachedDataSync = useCallback(<T>(key: string): T | null => {
    return dashboardCache.get<T>(key);
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (!enableBackgroundRefresh) {
        dashboardCache.clear();
      }
    };
  }, [enableBackgroundRefresh]);

  return {
    loading,
    error,
    getTasks,
    getUsers,
    getMetrics,
    prefetchDashboardData,
    invalidateCache,
    hasCachedData,
    getCachedDataSync,
    prefetchData
  };
};

export default useDashboardCache;