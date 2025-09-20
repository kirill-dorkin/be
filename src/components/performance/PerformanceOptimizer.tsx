'use client';

import React, { useEffect, useState } from 'react';
import { SuspenseMetrics } from './SuspenseOptimizer';
import { ImageMetrics } from './ImageOptimizer';
import { RouteOptimizer } from './RouteOptimizer';
import { CacheMetrics } from './CacheOptimizer';
import { useResourcePreloader } from './ResourcePreloader';
import { useBundleMetrics, useChunkPreloader } from './BundleOptimizer';
import { useRouteOptimizer } from './RouteOptimizer';

// Типы для общих метрик производительности
interface PerformanceMetrics {
  lcp: number;
  inp: number;
  cls: number;
  ttfb: number;
  fcp: number;
}

interface PerformanceConfig {
  enablePreloading: boolean;
  enableBundleOptimization: boolean;
  enableStreaming: boolean;
  enableImageOptimization: boolean;
  enableRouterOptimization: boolean;
  enableCaching: boolean;
  showMetrics: boolean;
}

// Класс для мониторинга общей производительности
class GlobalPerformanceMonitor {
  private static instance: GlobalPerformanceMonitor;
  private metrics: PerformanceMetrics = {
    lcp: 0,
    inp: 0,
    cls: 0,
    ttfb: 0,
    fcp: 0
  };
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];

  static getInstance(): GlobalPerformanceMonitor {
    if (!GlobalPerformanceMonitor.instance) {
      GlobalPerformanceMonitor.instance = new GlobalPerformanceMonitor();
    }
    return GlobalPerformanceMonitor.instance;
  }

  init(): void {
    this.measureWebVitals();
    this.measureNavigationTiming();
  }

  private measureWebVitals(): void {
    // Измеряем LCP
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        this.metrics.lcp = lastEntry.startTime;
        this.notifyObservers();
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Измеряем INP
      const inpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const inpEntry = entry as PerformanceEntry & { processingStart: number; startTime: number };
          this.metrics.inp = inpEntry.processingStart - inpEntry.startTime;
          this.notifyObservers();
        });
      });
      inpObserver.observe({ entryTypes: ['event'] });

      // Измеряем CLS
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as PerformanceEntry & { value: number };
          this.metrics.cls += clsEntry.value;
          this.notifyObservers();
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Измеряем FCP
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        this.metrics.fcp = lastEntry.startTime;
        this.notifyObservers();
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    }
  }

  private measureNavigationTiming(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0];
        this.metrics.ttfb = entry.responseStart - entry.fetchStart;
        this.notifyObservers();
      }
    }
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.metrics));
  }

  subscribe(observer: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(observer);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// Хук для глобальных метрик производительности
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    inp: 0,
    cls: 0,
    ttfb: 0,
    fcp: 0
  });

  useEffect(() => {
    const monitor = GlobalPerformanceMonitor.getInstance();
    monitor.init();
    
    const unsubscribe = monitor.subscribe(setMetrics);
    setMetrics(monitor.getMetrics());
    
    return unsubscribe;
  }, []);

  return metrics;
}

// Компонент для отображения общих метрик производительности
export function PerformanceMetricsDisplay() {
  const metrics = usePerformanceMetrics();

  const getScoreColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="performance-metrics p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Web Vitals</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-600">LCP</div>
          <div className={`text-xl font-bold ${getScoreColor(metrics.lcp, { good: 2500, poor: 4000 })}`}>
            {metrics.lcp.toFixed(0)}ms
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">INP</div>
          <div className={`text-xl font-bold ${getScoreColor(metrics.inp, { good: 200, poor: 500 })}`}>
            {metrics.inp.toFixed(0)}ms
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">CLS</div>
          <div className={`text-xl font-bold ${getScoreColor(metrics.cls, { good: 0.1, poor: 0.25 })}`}>
            {metrics.cls.toFixed(3)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">TTFB</div>
          <div className={`text-xl font-bold ${getScoreColor(metrics.ttfb, { good: 800, poor: 1800 })}`}>
            {metrics.ttfb.toFixed(0)}ms
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">FCP</div>
          <div className={`text-xl font-bold ${getScoreColor(metrics.fcp, { good: 1800, poor: 3000 })}`}>
            {metrics.fcp.toFixed(0)}ms
          </div>
        </div>
      </div>
    </div>
  );
}

// Главный компонент оптимизатора производительности
interface PerformanceOptimizerProps {
  config?: Partial<PerformanceConfig>;
  children: React.ReactNode;
}

export function PerformanceOptimizer({ 
  config = {}, 
  children 
}: PerformanceOptimizerProps) {
  const defaultConfig: PerformanceConfig = {
    enablePreloading: true,
    enableBundleOptimization: true,
    enableStreaming: true,
    enableImageOptimization: true,
    enableRouterOptimization: true,
    enableCaching: true,
    showMetrics: false
  };

  const finalConfig = { ...defaultConfig, ...config };
  const { preloadResource, metrics: preloadMetrics } = useResourcePreloader();
  const bundleMetrics = useBundleMetrics();
  const { preloadChunk } = useChunkPreloader();

  useEffect(() => {
    // Инициализируем глобальный мониторинг производительности
    const monitor = GlobalPerformanceMonitor.getInstance();
    monitor.init();

    // Предзагрузка критических ресурсов
    if (finalConfig.enablePreloading) {
      preloadResource({ href: '/api/critical-data', as: 'fetch', priority: 'high' });
      preloadResource({ href: '/fonts/main.woff2', as: 'font', priority: 'high' });
      preloadResource({ href: '/images/hero.webp', as: 'image', priority: 'auto' });
    }

    // Оптимизация бандла
    if (finalConfig.enableBundleOptimization) {
      preloadChunk('dashboard', 'medium');
      preloadChunk('profile', 'low');
    }
  }, []);

  return (
    <div className="performance-optimizer">
      {/* ResourcePreloader и BundleOptimizer будут добавлены позже */}
      
      {finalConfig.showMetrics && (
        <div className="performance-metrics-panel fixed bottom-4 right-4 z-50 max-w-sm">
          <div className="space-y-4">
            <PerformanceMetricsDisplay />
            {finalConfig.enableStreaming && <SuspenseMetrics />}
            {finalConfig.enableImageOptimization && <ImageMetrics />}
            {finalConfig.enableRouterOptimization && <RouteOptimizer />}
            {finalConfig.enableCaching && <CacheMetrics />}
            <div className="metric-card bg-white p-4 rounded-lg shadow">
               <h4 className="font-semibold mb-2">Resource Preloading</h4>
               <p>Resources Preloaded: {preloadMetrics.resourcesPreloaded}</p>
               <p>Routes Prefetched: {preloadMetrics.routesPrefetched}</p>
               <p>Preload Errors: {preloadMetrics.preloadErrors}</p>
             </div>
            <div className="metric-card bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold mb-2">Bundle Performance</h4>
              <p>Loaded Chunks: {bundleMetrics.loadedChunks.length}</p>
              <p>Failed Chunks: {bundleMetrics.failedChunks.length}</p>
              <p>Cache Efficiency: {((bundleMetrics.cacheHits / (bundleMetrics.cacheHits + bundleMetrics.networkRequests)) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
}

// Хук для использования всех оптимизаторов производительности
export function usePerformanceOptimizer() {
  const resourceMetrics = useResourcePreloader();
  const bundleMetrics = useBundleMetrics();
  const chunkPreloader = useChunkPreloader();
  const routeOptimizer = useRouteOptimizer();

  return {
    ...resourceMetrics,
    ...bundleMetrics,
    ...routeOptimizer,
    preloadChunk: chunkPreloader.preloadChunk,
  };
}

// HOC для автоматической оптимизации компонентов
export function withPerformanceOptimization<P extends React.JSX.IntrinsicAttributes = Record<string, unknown>>(
  Component: React.ComponentType<P>,
  optimizationConfig?: Partial<PerformanceConfig>
) {
  return function OptimizedComponent(props: P) {
    return (
      <PerformanceOptimizer config={optimizationConfig}>
        <Component {...props} />
      </PerformanceOptimizer>
    );
  };
}

export default PerformanceOptimizer;