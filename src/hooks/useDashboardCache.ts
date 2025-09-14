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
}

interface DashboardData {
  tasks: ITask[];
  users: IUser[];
  metrics: DashboardMetrics;
}

interface UseDashboardCacheOptions {
  cacheTimeout?: number; // в миллисекундах
  enablePrefetch?: boolean;
}

const CACHE_KEYS = {
  TASKS: 'dashboard_tasks',
  USERS: 'dashboard_users',
  METRICS: 'dashboard_metrics'
} as const;

class DashboardCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTimeout = 5 * 60 * 1000; // 5 минут

  set<T>(key: string, data: T, timeout?: number): void {
    const expiry = Date.now() + (timeout || this.defaultTimeout);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
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

  clear(): void {
    this.cache.clear();
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

// Глобальный экземпляр кэша
const dashboardCache = new DashboardCache();

export const useDashboardCache = ({
  cacheTimeout = 5 * 60 * 1000,
  enablePrefetch = true
}: UseDashboardCacheOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Мемоизированные функции для работы с кэшем
  const getCachedTasks = useCallback((): ITask[] | undefined => {
    return dashboardCache.get<ITask[]>(CACHE_KEYS.TASKS);
  }, []);

  const getCachedUsers = useCallback((): IUser[] | undefined => {
    return dashboardCache.get<IUser[]>(CACHE_KEYS.USERS);
  }, []);

  const getCachedMetrics = useCallback((): DashboardMetrics | undefined => {
    return dashboardCache.get<DashboardMetrics>(CACHE_KEYS.METRICS);
  }, []);

  const setCachedTasks = useCallback((tasks: ITask[]) => {
    dashboardCache.set(CACHE_KEYS.TASKS, tasks, cacheTimeout);
  }, [cacheTimeout]);

  const setCachedUsers = useCallback((users: IUser[]) => {
    dashboardCache.set(CACHE_KEYS.USERS, users, cacheTimeout);
  }, [cacheTimeout]);

  const setCachedMetrics = useCallback((metrics: DashboardMetrics) => {
    dashboardCache.set(CACHE_KEYS.METRICS, metrics, cacheTimeout);
  }, [cacheTimeout]);

  // Функция для инвалидации кэша
  const invalidateCache = useCallback((keys?: string[]) => {
    if (keys) {
      keys.forEach(key => dashboardCache.invalidate(key));
    } else {
      dashboardCache.clear();
    }
  }, []);

  // Проверка актуальности кэша
  const isCacheValid = useCallback((key: string): boolean => {
    return dashboardCache.has(key);
  }, []);

  // Мемоизированная функция для получения всех кэшированных данных
  const getCachedDashboardData = useMemo((): Partial<DashboardData> => {
    return {
      tasks: getCachedTasks(),
      users: getCachedUsers(),
      metrics: getCachedMetrics()
    };
  }, [getCachedTasks, getCachedUsers, getCachedMetrics]);

  // Функция для предзагрузки данных
  const prefetchData = useCallback(async () => {
    if (!enablePrefetch) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Здесь можно добавить логику предзагрузки данных
      // Например, запросы к API для получения свежих данных
      console.log('Prefetching dashboard data...');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка предзагрузки данных');
    } finally {
      setIsLoading(false);
    }
  }, [enablePrefetch]);

  // Эффект для автоматической предзагрузки при монтировании
  useEffect(() => {
    if (enablePrefetch) {
      prefetchData();
    }
  }, [prefetchData, enablePrefetch]);

  return {
    // Геттеры
    getCachedTasks,
    getCachedUsers,
    getCachedMetrics,
    getCachedDashboardData,
    
    // Сеттеры
    setCachedTasks,
    setCachedUsers,
    setCachedMetrics,
    
    // Утилиты
    invalidateCache,
    isCacheValid,
    prefetchData,
    
    // Состояние
    isLoading,
    error
  };
};

export default useDashboardCache;