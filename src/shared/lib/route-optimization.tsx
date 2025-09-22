'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import LoadingSkeleton from '@/shared/ui/LoadingSkeleton';

// Типы для роутов
export type RouteRole = 'admin' | 'worker' | 'public';

// Конфигурация для оптимизации роутов
export const routeConfig = {
  admin: {
    chunkName: 'admin',
    preload: true,
    ssr: false, // Admin панель не нуждается в SSR
  },
  worker: {
    chunkName: 'worker', 
    preload: true,
    ssr: false, // Worker панель не нуждается в SSR
  },
  public: {
    chunkName: 'public',
    preload: false,
    ssr: true, // Публичные страницы нуждаются в SSR для SEO
  },
} as const;

// Фабрика для создания оптимизированных компонентов страниц
export function createOptimizedPage<T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  role: RouteRole = 'public',
  customLoadingComponent?: () => React.ReactElement
) {
  const config = routeConfig[role];
  
  // Используем Next.js dynamic для создания ленивого компонента
  const OptimizedComponent = dynamic(importFn, {
    loading: () => customLoadingComponent ? customLoadingComponent() : (
      <div className="p-6">
        <LoadingSkeleton className="h-8 w-48 mb-4" />
        <LoadingSkeleton className="h-64 w-full mb-4" />
        <LoadingSkeleton className="h-32 w-3/4" />
      </div>
    ),
    ssr: config.ssr
  });

  return function WrappedPage(props: T) {
    return <OptimizedComponent {...(props as any)} />;
  };
}

// Специализированные loading компоненты для разных типов страниц
export const AdminPageLoading = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <LoadingSkeleton className="h-8 w-48" />
      <LoadingSkeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <LoadingSkeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  </div>
);

export const WorkerPageLoading = () => (
  <div className="p-6 space-y-4">
    <LoadingSkeleton className="h-8 w-64 mb-6" />
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <LoadingSkeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="h-4 w-3/4" />
            <LoadingSkeleton className="h-3 w-1/2" />
          </div>
          <LoadingSkeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  </div>
);

export const PublicPageLoading = () => (
  <div className="container mx-auto px-4 py-8">
    <LoadingSkeleton className="h-12 w-96 mx-auto mb-8" />
    <div className="max-w-4xl mx-auto space-y-6">
      <LoadingSkeleton className="h-64 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LoadingSkeleton className="h-48 w-full" />
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    </div>
  </div>
);

// Хелперы для создания оптимизированных страниц
export const createAdminPage = <T = {}>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
) => createOptimizedPage(importFn, 'admin', AdminPageLoading);

export const createWorkerPage = <T = {}>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
) => createOptimizedPage(importFn, 'worker', WorkerPageLoading);

export const createPublicPage = <T = {}>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
) => createOptimizedPage(importFn, 'public', PublicPageLoading);

// Утилиты для предзагрузки роутов
export const preloadRoutes = {
  admin: () => {
    // Предзагружаем критические admin компоненты
    import('@/app/admin/dashboard/page');
    import('@/features/dashboard/Sidebar');
  },
  worker: () => {
    // Предзагружаем критические worker компоненты  
    import('@/app/worker/my-tasks/page');
    import('@/features/dashboard/Sidebar');
  },
  public: () => {
    // Предзагружаем публичные компоненты при необходимости
    import('@/app/page');
  },
};

// Мониторинг производительности chunk'ов
export const chunkPerformanceMonitor = {
  trackChunkLoad: (chunkName: string, startTime: number) => {
    const loadTime = performance.now() - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Chunk Performance] ${chunkName} loaded in ${loadTime.toFixed(2)}ms`);
    }
    
    // В продакшене можно отправлять метрики в аналитику
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'chunk_load_time', {
        chunk_name: chunkName,
        load_time: Math.round(loadTime),
      });
    }
  },
};

// Мониторинг производительности роутов
export function trackRoutePerformance(routeName: string, startTime: number) {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Отправляем метрики в аналитику
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'route_performance', {
      route_name: routeName,
      duration_ms: Math.round(duration),
      custom_parameter: 'route_timing'
    });
  }
  
  // Логируем в консоль в dev режиме
  if (process.env.NODE_ENV === 'development') {
    console.log(`Route ${routeName} loaded in ${Math.round(duration)}ms`);
  }
}

export default {
  createOptimizedPage,
  createAdminPage,
  createWorkerPage,
  createPublicPage,
  preloadRoutes,
  chunkPerformanceMonitor,
};