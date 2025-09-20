'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

interface RouteMetrics {
  totalNavigations: number;
  averageNavigationTime: number;
  prefetchHits: number;
  prefetchMisses: number;
  cacheHits: number;
  slowRoutes: Array<{ path: string; averageTime: number }>;
  popularRoutes: Array<{ path: string; visits: number }>;
}

interface PrefetchConfig {
  strategy: 'viewport' | 'hover' | 'immediate' | 'idle';
  threshold: number;
  delay: number;
  maxConcurrent: number;
  priority: 'high' | 'low' | 'auto';
}

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean | PrefetchConfig;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  priority?: 'high' | 'low' | 'auto';
  preload?: boolean;
}

interface RoutePreloadOptions {
  routes: string[];
  strategy: 'immediate' | 'idle' | 'user-interaction';
  priority: 'high' | 'low' | 'auto';
}

// Router performance monitor
class RouterPerformanceMonitor {
  private static instance: RouterPerformanceMonitor;
  private metrics: RouteMetrics;
  private observers: Set<(metrics: RouteMetrics) => void> = new Set();
  private navigationTimes = new Map<string, number[]>();
  private routeVisits = new Map<string, number>();
  private prefetchCache = new Set<string>();
  private prefetchQueue = new Set<string>();
  private maxConcurrentPrefetch = 3;
  private currentPrefetches = 0;

  constructor() {
    this.metrics = {
      totalNavigations: 0,
      averageNavigationTime: 0,
      prefetchHits: 0,
      prefetchMisses: 0,
      cacheHits: 0,
      slowRoutes: [],
      popularRoutes: []
    };

    this.setupNavigationObserver();
  }

  static getInstance(): RouterPerformanceMonitor {
    if (!RouterPerformanceMonitor.instance) {
      RouterPerformanceMonitor.instance = new RouterPerformanceMonitor();
    }
    return RouterPerformanceMonitor.instance;
  }

  private setupNavigationObserver(): void {
    if (typeof window === 'undefined') return;

    // Monitor navigation timing
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.trackNavigation(entry as PerformanceNavigationTiming);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.warn('Navigation observer not supported:', error);
    }
  }

  private trackNavigation(entry: PerformanceNavigationTiming): void {
    const navigationTime = entry.loadEventEnd - entry.fetchStart;
    const currentPath = window.location.pathname;

    // Track navigation time
    if (!this.navigationTimes.has(currentPath)) {
      this.navigationTimes.set(currentPath, []);
    }
    this.navigationTimes.get(currentPath)!.push(navigationTime);

    // Track route visits
    const visits = this.routeVisits.get(currentPath) || 0;
    this.routeVisits.set(currentPath, visits + 1);

    // Update metrics
    this.updateMetrics();
  }

  private updateMetrics(): void {
    this.metrics.totalNavigations = Array.from(this.navigationTimes.values())
      .reduce((sum, times) => sum + times.length, 0);

    // Calculate average navigation time
    const allTimes = Array.from(this.navigationTimes.values()).flat();
    this.metrics.averageNavigationTime = allTimes.length > 0
      ? allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length
      : 0;

    // Find slow routes (above 2 seconds average)
    this.metrics.slowRoutes = Array.from(this.navigationTimes.entries())
      .map(([path, times]) => ({
        path,
        averageTime: times.reduce((sum, time) => sum + time, 0) / times.length
      }))
      .filter(route => route.averageTime > 2000)
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);

    // Find popular routes
    this.metrics.popularRoutes = Array.from(this.routeVisits.entries())
      .map(([path, visits]) => ({ path, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    this.notifyObservers();
  }

  trackPrefetch(path: string): void {
    this.prefetchCache.add(path);
  }

  trackPrefetchHit(path: string): void {
    if (this.prefetchCache.has(path)) {
      this.metrics.prefetchHits++;
    } else {
      this.metrics.prefetchMisses++;
    }
    this.notifyObservers();
  }

  async prefetchRoute(path: string, priority: 'high' | 'low' | 'auto' = 'auto'): Promise<void> {
    if (this.prefetchCache.has(path) || this.prefetchQueue.has(path)) {
      return;
    }

    if (this.currentPrefetches >= this.maxConcurrentPrefetch) {
      this.prefetchQueue.add(path);
      return;
    }

    this.currentPrefetches++;
    this.prefetchQueue.add(path);

    try {
      // Use Next.js router prefetch
      if (typeof window !== 'undefined' && window.next?.router) {
        await window.next.router.prefetch(path);
      } else {
        // Fallback: prefetch via link rel="prefetch"
        await this.prefetchViaLink(path, priority);
      }

      this.trackPrefetch(path);
    } catch (error) {
      console.warn(`Failed to prefetch ${path}:`, error);
    } finally {
      this.currentPrefetches--;
      this.prefetchQueue.delete(path);
      this.processQueue();
    }
  }

  private async prefetchViaLink(path: string, priority: 'high' | 'low' | 'auto'): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = priority === 'high' ? 'preload' : 'prefetch';
      link.href = path;
      link.as = 'document';
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to prefetch ${path}`));
      
      document.head.appendChild(link);
      
      // Clean up after 30 seconds
      setTimeout(() => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      }, 30000);
    });
  }

  private processQueue(): void {
    if (this.prefetchQueue.size > 0 && this.currentPrefetches < this.maxConcurrentPrefetch) {
      const nextPath = Array.from(this.prefetchQueue)[0];
      this.prefetchQueue.delete(nextPath);
      this.prefetchRoute(nextPath);
    }
  }

  subscribe(observer: (metrics: RouteMetrics) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer({ ...this.metrics }));
  }

  getMetrics(): RouteMetrics {
    return { ...this.metrics };
  }

  // Analyze routing performance
  analyzeRoutingPerformance(): {
    prefetchEfficiency: number;
    navigationSpeed: 'fast' | 'medium' | 'slow';
    cacheUtilization: number;
    recommendations: string[];
  } {
    const totalPrefetches = this.metrics.prefetchHits + this.metrics.prefetchMisses;
    const prefetchEfficiency = totalPrefetches > 0 
      ? (this.metrics.prefetchHits / totalPrefetches) * 100 
      : 0;

    let navigationSpeed: 'fast' | 'medium' | 'slow' = 'fast';
    if (this.metrics.averageNavigationTime > 3000) {
      navigationSpeed = 'slow';
    } else if (this.metrics.averageNavigationTime > 1500) {
      navigationSpeed = 'medium';
    }

    const cacheUtilization = this.metrics.totalNavigations > 0
      ? (this.metrics.cacheHits / this.metrics.totalNavigations) * 100
      : 0;

    const recommendations: string[] = [];
    
    if (prefetchEfficiency < 70) {
      recommendations.push('Improve prefetch strategy for better cache utilization');
    }
    
    if (navigationSpeed === 'slow') {
      recommendations.push('Optimize slow routes and implement code splitting');
    }
    
    if (this.metrics.slowRoutes.length > 0) {
      recommendations.push(`Focus on optimizing: ${this.metrics.slowRoutes[0].path}`);
    }
    
    if (cacheUtilization < 50) {
      recommendations.push('Implement better caching strategy for routes');
    }

    return {
      prefetchEfficiency,
      navigationSpeed,
      cacheUtilization,
      recommendations
    };
  }
}

// Smart Link component with intelligent prefetching
export const SmartLink: React.FC<SmartLinkProps> = ({
  href,
  children,
  prefetch = true,
  className = '',
  style,
  onClick,
  priority = 'auto',
  preload = false
}) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isPrefetched, setIsPrefetched] = useState(false);
  const monitor = RouterPerformanceMonitor.getInstance();
  // const router = useRouter();

  const handlePrefetch = useCallback(async () => {
    if (isPrefetched || typeof prefetch === 'boolean' && !prefetch) return;

    const config: PrefetchConfig = typeof prefetch === 'object' 
      ? prefetch 
      : { strategy: 'hover', threshold: 0.1, delay: 100, maxConcurrent: 3, priority };

    try {
      await monitor.prefetchRoute(href, config.priority);
      setIsPrefetched(true);
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }, [href, prefetch, priority, isPrefetched, monitor]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    monitor.trackPrefetchHit(href);
    onClick?.(e);
  }, [href, onClick, monitor]);

  useEffect(() => {
    if (!linkRef.current || typeof prefetch === 'boolean' && !prefetch) return;

    const config: PrefetchConfig = typeof prefetch === 'object' 
      ? prefetch 
      : { strategy: 'viewport', threshold: 0.1, delay: 100, maxConcurrent: 3, priority };

    let timeoutId: NodeJS.Timeout;
    let observer: IntersectionObserver;

    const setupPrefetch = () => {
      switch (config.strategy) {
        case 'immediate':
          handlePrefetch();
          break;

        case 'idle':
          if (window.requestIdleCallback) {
            window.requestIdleCallback(handlePrefetch);
          } else {
            timeoutId = setTimeout(handlePrefetch, config.delay);
          }
          break;

        case 'viewport':
          observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                timeoutId = setTimeout(handlePrefetch, config.delay);
                observer.disconnect();
              }
            },
            { threshold: config.threshold }
          );
          observer.observe(linkRef.current!);
          break;

        case 'hover':
          // Handled by onMouseEnter
          break;
      }
    };

    setupPrefetch();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [prefetch, priority, handlePrefetch]);

  const handleMouseEnter = useCallback(() => {
    const config: PrefetchConfig = typeof prefetch === 'object' 
      ? prefetch 
      : { strategy: 'hover', threshold: 0.1, delay: 100, maxConcurrent: 3, priority };

    if (config.strategy === 'hover') {
      const timeoutId = setTimeout(handlePrefetch, config.delay);
      return () => clearTimeout(timeoutId);
    }
  }, [prefetch, priority, handlePrefetch]);

  // Preload critical resources
  useEffect(() => {
    if (preload && priority === 'high') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = 'document';
      document.head.appendChild(link);

      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [href, preload, priority]);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      style={style}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      prefetch={false} // We handle prefetching manually
    >
      {children}
    </Link>
  );
};

// Route preloader component
export const RoutePreloader: React.FC<RoutePreloadOptions> = ({
  routes,
  strategy = 'idle',
  priority = 'low'
}) => {
  const monitor = RouterPerformanceMonitor.getInstance();

  useEffect(() => {
    const preloadRoutes = async () => {
      switch (strategy) {
        case 'immediate':
          for (const route of routes) {
            await monitor.prefetchRoute(route, priority);
          }
          break;

        case 'idle':
          if (window.requestIdleCallback) {
            window.requestIdleCallback(async () => {
              for (const route of routes) {
                await monitor.prefetchRoute(route, priority);
              }
            });
          } else {
            setTimeout(async () => {
              for (const route of routes) {
                await monitor.prefetchRoute(route, priority);
              }
            }, 1000);
          }
          break;

        case 'user-interaction':
          const handleUserInteraction = async () => {
            for (const route of routes) {
              await monitor.prefetchRoute(route, priority);
            }
            // Remove listeners after first interaction
            document.removeEventListener('mousedown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
          };

          document.addEventListener('mousedown', handleUserInteraction, { once: true });
          document.addEventListener('touchstart', handleUserInteraction, { once: true });
          document.addEventListener('keydown', handleUserInteraction, { once: true });

          return () => {
            document.removeEventListener('mousedown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
          };
      }
    };

    preloadRoutes();
  }, [routes, strategy, priority, monitor]);

  return null; // This component doesn't render anything
};

// Router metrics display
export const RouterMetrics: React.FC<{
  showDetails?: boolean;
}> = ({ showDetails = false }) => {
  const [metrics, setMetrics] = useState<RouteMetrics>(() => 
    RouterPerformanceMonitor.getInstance().getMetrics()
  );
  const [analysis, setAnalysis] = useState(() => 
    RouterPerformanceMonitor.getInstance().analyzeRoutingPerformance()
  );

  useEffect(() => {
    const monitor = RouterPerformanceMonitor.getInstance();
    
    const unsubscribe = monitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setAnalysis(monitor.analyzeRoutingPerformance());
    });

    return unsubscribe;
  }, []);

  return (
    <div className="router-metrics p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Router Performance</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="metric">
          <div className="text-sm text-gray-600">Total Navigations</div>
          <div className="text-lg font-bold">{metrics.totalNavigations}</div>
        </div>
        
        <div className="metric">
          <div className="text-sm text-gray-600">Avg Navigation Time</div>
          <div className="text-lg font-bold">
            {metrics.averageNavigationTime.toFixed(0)}ms
          </div>
        </div>
        
        <div className="metric">
          <div className="text-sm text-gray-600">Prefetch Efficiency</div>
          <div className="text-lg font-bold text-green-600">
            {analysis.prefetchEfficiency.toFixed(1)}%
          </div>
        </div>
        
        <div className="metric">
          <div className="text-sm text-gray-600">Navigation Speed</div>
          <div className={`text-lg font-bold ${
            analysis.navigationSpeed === 'fast' ? 'text-green-600' :
            analysis.navigationSpeed === 'medium' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {analysis.navigationSpeed}
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          <div className="details grid grid-cols-2 gap-4 mb-4">
            <div className="metric">
              <div className="text-sm text-gray-600">Prefetch Hits</div>
              <div className="text-lg font-bold text-green-600">{metrics.prefetchHits}</div>
            </div>
            <div className="metric">
              <div className="text-sm text-gray-600">Prefetch Misses</div>
              <div className="text-lg font-bold text-red-600">{metrics.prefetchMisses}</div>
            </div>
          </div>

          {metrics.slowRoutes.length > 0 && (
            <div className="slow-routes mb-4">
              <h4 className="font-semibold mb-2">Slow Routes</h4>
              <div className="space-y-1">
                {metrics.slowRoutes.map((route, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">{route.path}</span>
                    <span className="text-red-600">{route.averageTime.toFixed(0)}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metrics.popularRoutes.length > 0 && (
            <div className="popular-routes mb-4">
              <h4 className="font-semibold mb-2">Popular Routes</h4>
              <div className="space-y-1">
                {metrics.popularRoutes.slice(0, 5).map((route, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">{route.path}</span>
                    <span className="text-blue-600">{route.visits} visits</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {analysis.recommendations.length > 0 && (
        <div className="recommendations">
          <h4 className="font-semibold mb-2">Recommendations</h4>
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

// Hook for router metrics
export function useRouterMetrics() {
  const [metrics, setMetrics] = useState<RouteMetrics>(() => 
    RouterPerformanceMonitor.getInstance().getMetrics()
  );

  useEffect(() => {
    const monitor = RouterPerformanceMonitor.getInstance();
    const unsubscribe = monitor.subscribe(setMetrics);
    return unsubscribe;
  }, []);

  return metrics;
}

// Hook for smart prefetching
export function useSmartPrefetch(routes: string[], strategy: 'viewport' | 'hover' | 'idle' = 'idle') {
  const monitor = RouterPerformanceMonitor.getInstance();

  useEffect(() => {
    const prefetchRoutes = async () => {
      switch (strategy) {
        case 'idle':
          if (window.requestIdleCallback) {
            window.requestIdleCallback(async () => {
              for (const route of routes) {
                await monitor.prefetchRoute(route, 'low');
              }
            });
          }
          break;
        // Other strategies can be implemented as needed
      }
    };

    prefetchRoutes();
  }, [routes, strategy, monitor]);
}

// Global declarations for Next.js router

export default RouterPerformanceMonitor;