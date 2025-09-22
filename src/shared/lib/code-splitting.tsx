'use client';

import { Suspense, ComponentType, ReactNode, useState, useEffect, ComponentProps } from 'react';
import React from "react";
import dynamic from 'next/dynamic';
import { LoadingFallback } from "@/shared/ui/fallbacks";

// Типы для code splitting
export interface ChunkConfig {
  name: string;
  priority: 'high' | 'medium' | 'low';
  preload?: boolean;
  timeout?: number;
}

export interface SplitComponentProps {
  fallback?: ReactNode;
  errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
  timeout?: number;
}

// Утилиты для оптимизации chunk размеров
export const chunkOptimizationUtils = {
  // Анализ размеров chunks
  analyzeChunkSizes: () => {
    if (typeof window === 'undefined') return null;
    
    const performance = window.performance;
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const jsChunks = resources.filter(resource => 
      resource.name.includes('/_next/static/chunks/') && 
      resource.name.endsWith('.js')
    );
    
    return {
      totalChunks: jsChunks.length,
      totalSize: jsChunks.reduce((sum, chunk) => sum + (chunk.transferSize || 0), 0),
      chunks: jsChunks.map(chunk => ({
        name: chunk.name.split('/').pop() || 'unknown',
        size: chunk.transferSize || 0,
        loadTime: chunk.responseEnd - chunk.requestStart,
        cached: chunk.transferSize === 0
      }))
    };
  },

  // Предзагрузка критических chunks
  preloadCriticalChunks: async (chunkNames: string[]) => {
    if (typeof window === 'undefined') return;
    
    const preloadPromises = chunkNames.map(chunkName => {
      return new Promise<void>((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'modulepreload';
        link.href = `/_next/static/chunks/${chunkName}.js`;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to preload chunk: ${chunkName}`));
        document.head.appendChild(link);
      });
    });
    
    try {
      await Promise.all(preloadPromises);
      console.log('Critical chunks preloaded successfully');
    } catch (error) {
      console.warn('Some chunks failed to preload:', error);
    }
  },

  // Оптимизация загрузки по приоритету
  loadChunksByPriority: async (chunks: ChunkConfig[]) => {
    const sortedChunks = chunks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const chunk of sortedChunks) {
      if (chunk.preload) {
        await chunkOptimizationUtils.preloadCriticalChunks([chunk.name]);
      }
    }
  },

  // Мониторинг производительности chunks
  monitorChunkPerformance: () => {
    if (typeof window === 'undefined') return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name.includes('/_next/static/chunks/')) {
          console.log(`Chunk loaded: ${entry.name}`, {
            duration: entry.duration,
            size: (entry as PerformanceResourceTiming).transferSize,
            cached: (entry as PerformanceResourceTiming).transferSize === 0
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    return () => observer.disconnect();
  }
};

// Хук для мониторинга code splitting
export const useCodeSplitting = () => {
  const [metrics, setMetrics] = useState<{
    chunksLoaded: number;
    totalLoadTime: number;
    failedChunks: string[];
    cacheHitRate: number;
  }>({
    chunksLoaded: 0,
    totalLoadTime: 0,
    failedChunks: [],
    cacheHitRate: 0
  });

  useEffect(() => {
    const cleanup = chunkOptimizationUtils.monitorChunkPerformance();
    
    // Анализ текущих chunks
    const analysis = chunkOptimizationUtils.analyzeChunkSizes();
    if (analysis) {
      const cachedChunks = analysis.chunks.filter(chunk => chunk.cached).length;
      setMetrics(prev => ({
        ...prev,
        chunksLoaded: analysis.chunks.length,
        totalLoadTime: analysis.chunks.reduce((sum, chunk) => sum + chunk.loadTime, 0),
        cacheHitRate: analysis.chunks.length > 0 ? cachedChunks / analysis.chunks.length : 0
      }));
    }
    
    return cleanup;
  }, []);

  return {
    metrics,
    preloadChunks: chunkOptimizationUtils.preloadCriticalChunks,
    analyzeChunks: chunkOptimizationUtils.analyzeChunkSizes
  };
};

// Компонент для отображения метрик code splitting
export const CodeSplittingMetrics = () => {
  const { metrics, analyzeChunks } = useCodeSplitting();
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeChunks>>(null);

  useEffect(() => {
    const result = analyzeChunks();
    setAnalysis(result);
  }, [analyzeChunks]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="font-bold mb-2">Code Splitting Metrics</div>
      <div>Chunks Loaded: {metrics.chunksLoaded}</div>
      <div>Total Load Time: {metrics.totalLoadTime.toFixed(2)}ms</div>
      <div>Cache Hit Rate: {(metrics.cacheHitRate * 100).toFixed(1)}%</div>
      {analysis && (
        <div>Total Size: {(analysis.totalSize / 1024).toFixed(1)}KB</div>
      )}
      {metrics.failedChunks.length > 0 && (
        <div className="text-red-400">
          Failed: {metrics.failedChunks.join(', ')}
        </div>
      )}
    </div>
  );
};

// Интерфейс для опций lazy компонента
interface LazyComponentOptions {
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  retryCount?: number;
  timeout?: number;
  displayName?: string;
}

// Создание lazy компонента с улучшенной обработкой ошибок
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): ComponentType<any> {
  const { retryCount = 3, displayName } = options;
  
  const lazyComponent = dynamic(async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i <= retryCount; i++) {
      try {
        const module = await importFn();
        return module;
      } catch (error) {
        lastError = error as Error;
        if (i < retryCount) {
          // Экспоненциальная задержка между попытками
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    throw lastError;
  }, {
    loading: () => <LoadingFallback />,
    ssr: false
  });
  
  // displayName устанавливается через Object.defineProperty для совместимости
  if (displayName) {
    Object.defineProperty(lazyComponent, 'displayName', {
      value: displayName,
      writable: false
    });
  }
  
  return lazyComponent;
}

// Создание lazy компонента для named exports
export function createLazyNamedComponent<T extends ComponentType<any>>(
  importFn: () => Promise<Record<string, any>>,
  componentName: string,
  options: LazyComponentOptions = {}
): ComponentType<any> {
  const { retryCount = 3, displayName } = options;
  
  const lazyComponent = dynamic(async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i <= retryCount; i++) {
      try {
        const module = await importFn();
        return { default: module[componentName] };
      } catch (error) {
        lastError = error as Error;
        if (i < retryCount) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    throw lastError;
  }, {
    loading: () => <LoadingFallback />,
    ssr: false
  });
  
  // displayName устанавливается через Object.defineProperty для совместимости
  if (displayName) {
    Object.defineProperty(lazyComponent, 'displayName', {
      value: displayName,
      writable: false
    });
  }
  
  return lazyComponent;
}

// Временно отключены lazy импорты страниц
// export const LazyAdminDashboard = createLazyComponent(
//   () => import("@/app/admin/dashboard/page"),
//   { retryCount: 2 }
// );

// export const LazyAdminUsers = createLazyComponent(
//   () => import("@/app/admin/users/page"),
//   { retryCount: 2 }
// );

// export const LazyAdminTasks = createLazyComponent(
//   () => import("@/app/admin/tasks/page"),
//   { retryCount: 2 }
// );

// Предзагруженные компоненты для воркеров
// export const LazyWorkerMyTasks = createLazyComponent(
//   () => import("@/app/worker/my-tasks/page"),
//   { retryCount: 2 }
// );

// Временно отключены lazy импорты UI компонентов
// export const LazyCalendar = createLazyNamedComponent(
//   () => import("@/shared/ui/calendar"),
//   "Calendar",
//   { displayName: "Calendar" }
// );

// export const LazyTable = createLazyNamedComponent(
//   () => import("@/shared/ui/table"),
//   "Table",
//   { displayName: "Table" }
// );

// export const LazyPerformanceDashboard = createLazyComponent(
//   () => import("@/shared/ui/PerformanceDashboard"),
//   { displayName: "PerformanceDashboard" }
// );

// export const LazyCarousel = createLazyNamedComponent(
//   () => import("@/shared/ui/carousel"),
//   "Carousel",
//   { displayName: "Carousel" }
// );

// Предзагрузка критических компонентов
export const preloadCriticalComponents = () => {
  if (typeof window !== 'undefined') {
    // Предзагружаем только в браузере
    import("@/shared/ui/table");
    import("@/shared/ui/PerformanceDashboard");
  }
};

// Предзагрузка критических компонентов для ролей
export const preloadRoleComponents = async (role: string) => {
  if (role === "admin") {
    await Promise.all([
      import("@/shared/ui/table"),
      import("@/shared/ui/PerformanceDashboard"),
    ]);
  } else if (role === "worker") {
    await Promise.all([
      import("@/app/worker/my-tasks/page"),
      import("@/shared/ui/table"),
    ]);
  }
};

// Hook для динамического импорта
export const useDynamicImport = <T,>(
  importFn: () => Promise<T>,
  deps: React.DependencyList = []
) => {
  const [state, setState] = React.useState<{
    loading: boolean;
    data: T | null;
    error: Error | null;
  }>({
    loading: true,
    data: null,
    error: null,
  });

  React.useEffect(() => {
    let cancelled = false;

    setState(prev => ({ ...prev, loading: true, error: null }));

    importFn()
      .then(data => {
        if (!cancelled) {
          setState({ loading: false, data, error: null });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ loading: false, data: null, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
};

// Error Boundary интерфейсы
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Error Boundary класс
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Lazy component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Wrapper для lazy компонентов
export const LazyWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  fallbackType?: "table" | "dashboard" | "calendar" | "carousel" | "page" | "form";
  error?: React.ReactNode;
}> = ({ 
  children, 
  fallback,
  fallbackType = "page",
  error = <div className="text-red-500 p-4 border border-red-200 rounded-lg bg-red-50">
    <div className="flex items-center space-x-2">
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>Ошибка загрузки компонента</span>
    </div>
  </div>
}) => {
  const defaultFallback = fallback || <LoadingFallback type={fallbackType} />;
  
  return (
    <ErrorBoundary fallback={error}>
      <React.Suspense fallback={defaultFallback}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
};

export default {
  createLazyComponent,
  preloadCriticalComponents,
  preloadRoleComponents,
  useDynamicImport,
  LazyWrapper,
};