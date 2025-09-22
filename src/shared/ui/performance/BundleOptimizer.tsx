'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

interface BundleMetrics {
  totalSize: number;
  loadedChunks: string[];
  pendingChunks: string[];
  failedChunks: string[];
  loadTimes: Record<string, number>;
  cacheHits: number;
  networkRequests: number;
}

interface LazyComponentProps<P extends React.JSX.IntrinsicAttributes = object> {
  loader: () => Promise<{ default: React.ComponentType<P> }>;
  fallback?: React.ReactNode;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  chunkName?: string;
  componentProps?: P;
}

interface DynamicImportOptions {
  ssr?: boolean;
  loading?: () => React.ReactElement | null;
  suspense?: boolean;
}

// Bundle performance monitor
class BundlePerformanceMonitor {
  private static instance: BundlePerformanceMonitor;
  private metrics: BundleMetrics;
  private observers: Set<(metrics: BundleMetrics) => void> = new Set();
  private chunkLoadPromises = new Map<string, Promise<unknown>>();
  private preloadedChunks = new Set<string>();

  constructor() {
    this.metrics = {
      totalSize: 0,
      loadedChunks: [],
      pendingChunks: [],
      failedChunks: [],
      loadTimes: {},
      cacheHits: 0,
      networkRequests: 0
    };

    this.setupPerformanceObserver();
    this.setupChunkTracking();
  }

  static getInstance(): BundlePerformanceMonitor {
    if (!BundlePerformanceMonitor.instance) {
      BundlePerformanceMonitor.instance = new BundlePerformanceMonitor();
    }
    return BundlePerformanceMonitor.instance;
  }

  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.name.includes('chunk')) {
            this.trackChunkLoad(entry as PerformanceResourceTiming);
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Failed to setup performance observer:', error);
    }
  }

  private setupChunkTracking(): void {
    if (typeof window === 'undefined') return;

    // Hook into webpack chunk loading
    const webpackRequire = window.__webpack_require__;
    const originalChunkLoad = webpackRequire?.e;
    if (originalChunkLoad && webpackRequire && typeof originalChunkLoad === 'function') {
      webpackRequire.e = (chunkId: string) => {
        const startTime = performance.now();
        this.metrics.pendingChunks.push(chunkId);
        this.notifyObservers();

        const promise = originalChunkLoad.call(webpackRequire, chunkId);
        
        promise
          .then(() => {
            const loadTime = performance.now() - startTime;
            this.onChunkLoaded(chunkId, loadTime);
          })
          .catch(() => {
            this.onChunkFailed(chunkId);
          });

        return promise;
      };
    }
  }

  private trackChunkLoad(entry: PerformanceResourceTiming): void {
    const chunkName = this.extractChunkName(entry.name);
    if (!chunkName) return;

    this.metrics.totalSize += entry.transferSize || 0;
    this.metrics.loadTimes[chunkName] = entry.duration;
    
    if (entry.transferSize === 0) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.networkRequests++;
    }

    this.notifyObservers();
  }

  private extractChunkName(url: string): string | null {
    const match = url.match(/\/([^\/]+)\.js$/);
    return match ? match[1] : null;
  }

  private onChunkLoaded(chunkId: string, loadTime: number): void {
    this.metrics.pendingChunks = this.metrics.pendingChunks.filter(id => id !== chunkId);
    this.metrics.loadedChunks.push(chunkId);
    this.metrics.loadTimes[chunkId] = loadTime;
    this.notifyObservers();
  }

  private onChunkFailed(chunkId: string): void {
    this.metrics.pendingChunks = this.metrics.pendingChunks.filter(id => id !== chunkId);
    this.metrics.failedChunks.push(chunkId);
    this.notifyObservers();
  }

  preloadChunk(chunkName: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    if (this.preloadedChunks.has(chunkName)) {
      return Promise.resolve();
    }

    this.preloadedChunks.add(chunkName);

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = priority === 'high' ? 'preload' : 'prefetch';
      link.as = 'script';
      link.href = `/_next/static/chunks/${chunkName}.js`;
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload chunk: ${chunkName}`));
      
      document.head.appendChild(link);
    });
  }

  subscribe(observer: (metrics: BundleMetrics) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer({ ...this.metrics }));
  }

  getMetrics(): BundleMetrics {
    return { ...this.metrics };
  }

  // Analyze bundle performance
  analyzeBundlePerformance(): {
    averageLoadTime: number;
    slowestChunks: Array<{ name: string; time: number }>;
    cacheEfficiency: number;
    recommendations: string[];
  } {
    const loadTimes = Object.values(this.metrics.loadTimes);
    const averageLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
      : 0;

    const slowestChunks = Object.entries(this.metrics.loadTimes)
      .map(([name, time]) => ({ name, time }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);

    const totalRequests = this.metrics.cacheHits + this.metrics.networkRequests;
    const cacheEfficiency = totalRequests > 0 
      ? (this.metrics.cacheHits / totalRequests) * 100 
      : 0;

    const recommendations: string[] = [];
    
    if (averageLoadTime > 1000) {
      recommendations.push('Consider code splitting large components');
    }
    
    if (cacheEfficiency < 50) {
      recommendations.push('Improve caching strategy for better performance');
    }
    
    if (this.metrics.failedChunks.length > 0) {
      recommendations.push('Investigate failed chunk loads');
    }

    return {
      averageLoadTime,
      slowestChunks,
      cacheEfficiency,
      recommendations
    };
  }
}

// Enhanced lazy component with performance tracking
export const LazyComponent = <P extends React.JSX.IntrinsicAttributes = object>({
  loader,
  fallback = <div>Loading...</div>,
  errorBoundary: ErrorBoundary,
  preload = false,
  priority = 'medium',
  chunkName,
  componentProps
}: LazyComponentProps<P>) => {
  const [Component, setComponent] = useState<React.ComponentType<P> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const monitor = BundlePerformanceMonitor.getInstance();

  const loadComponent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startTime = performance.now();
      const loadedModule = await loader();
      const loadTime = performance.now() - startTime;
      
      setComponent(() => loadedModule.default);
      
      // Track loading performance
      if (chunkName) {
        monitor.getMetrics().loadTimes[chunkName] = loadTime;
      }
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load component');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [loader, chunkName, monitor]);

  // Preload if requested
  useEffect(() => {
    if (preload && chunkName) {
      monitor.preloadChunk(chunkName, priority);
    }
  }, [preload, chunkName, priority, monitor]);

  // Load component
  useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  if (loading) {
    return <>{fallback}</>;
  }

  if (error) {
    if (ErrorBoundary) {
      return <ErrorBoundary error={error} retry={loadComponent} />;
    }
    throw error;
  }

  if (!Component) {
    return <>{fallback}</>;
  }

  return <Component {...(componentProps || {} as P)} />;
};

// Smart dynamic import with optimization
export function createDynamicComponent<P extends React.JSX.IntrinsicAttributes = object>(
  loader: () => Promise<{ default: React.ComponentType<P> }>,
  options: DynamicImportOptions & {
    preload?: boolean;
    priority?: 'high' | 'medium' | 'low';
    chunkName?: string;
  } = {}
) {
  const {
    ssr = true,
    loading,
    suspense = false,
    preload = false,
    priority = 'medium',
    chunkName,
    ...dynamicOptions
  } = options;

  const DynamicComponent = dynamic(loader, {
    ssr,
    loading,
    ...dynamicOptions
  }) as React.ComponentType<P>;

  // Enhanced component with preloading
  const EnhancedComponent = (props: P) => {
    const monitor = BundlePerformanceMonitor.getInstance();

    useEffect(() => {
      if (preload && chunkName) {
        monitor.preloadChunk(chunkName, priority);
      }
    }, [monitor]);

    if (suspense) {
      return (
        <Suspense fallback={loading ? loading() : <div>Loading...</div>}>
          <DynamicComponent {...props} />
        </Suspense>
      );
    }

    return <DynamicComponent {...props} />;
  };

  return EnhancedComponent;
}

// Bundle analyzer component
export const BundleAnalyzer: React.FC<{
  showMetrics?: boolean;
  showRecommendations?: boolean;
}> = ({ 
  showMetrics = true, 
  showRecommendations = true 
}) => {
  const [metrics, setMetrics] = useState<BundleMetrics>(() => 
    BundlePerformanceMonitor.getInstance().getMetrics()
  );
  const [analysis, setAnalysis] = useState(() => 
    BundlePerformanceMonitor.getInstance().analyzeBundlePerformance()
  );

  useEffect(() => {
    const monitor = BundlePerformanceMonitor.getInstance();
    
    const unsubscribe = monitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setAnalysis(monitor.analyzeBundlePerformance());
    });

    return unsubscribe;
  }, []);

  if (!showMetrics && !showRecommendations) {
    return null;
  }

  return (
    <div className="bundle-analyzer p-4 bg-gray-100 rounded-lg">
      {showMetrics && (
        <div className="metrics mb-4">
          <h3 className="text-lg font-semibold mb-2">Bundle Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="metric">
              <div className="text-sm text-gray-600">Total Size</div>
              <div className="text-lg font-bold">
                {(metrics.totalSize / 1024).toFixed(1)} KB
              </div>
            </div>
            <div className="metric">
              <div className="text-sm text-gray-600">Loaded Chunks</div>
              <div className="text-lg font-bold">{metrics.loadedChunks.length}</div>
            </div>
            <div className="metric">
              <div className="text-sm text-gray-600">Cache Hit Rate</div>
              <div className="text-lg font-bold">
                {analysis.cacheEfficiency.toFixed(1)}%
              </div>
            </div>
            <div className="metric">
              <div className="text-sm text-gray-600">Avg Load Time</div>
              <div className="text-lg font-bold">
                {analysis.averageLoadTime.toFixed(0)}ms
              </div>
            </div>
          </div>
        </div>
      )}

      {showRecommendations && analysis.recommendations.length > 0 && (
        <div className="recommendations">
          <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
          <ul className="list-disc list-inside space-y-1">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-700">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Hook for bundle metrics
export function useBundleMetrics() {
  const [metrics, setMetrics] = useState<BundleMetrics>(() => 
    BundlePerformanceMonitor.getInstance().getMetrics()
  );

  useEffect(() => {
    const monitor = BundlePerformanceMonitor.getInstance();
    const unsubscribe = monitor.subscribe(setMetrics);
    return unsubscribe;
  }, []);

  return metrics;
}

// Hook for preloading chunks
export function useChunkPreloader() {
  const monitor = BundlePerformanceMonitor.getInstance();

  const preloadChunk = useCallback((
    chunkName: string, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    return monitor.preloadChunk(chunkName, priority);
  }, [monitor]);

  return { preloadChunk };
}

// Webpack chunk loading types
// Window.__webpack_require__ объявлен в SmartRouter.tsx

export default BundlePerformanceMonitor;