'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface SmartRouterProps {
  children: React.ReactNode;
  prefetchStrategy?: 'hover' | 'viewport' | 'immediate' | 'none';
  prefetchDelay?: number;
  maxPrefetchCount?: number;
  enableAnalytics?: boolean;
}

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean | 'hover' | 'viewport';
  priority?: 'high' | 'medium' | 'low';
  preload?: Array<'scripts' | 'styles' | 'images'>;
  onNavigate?: (href: string) => void;
}

interface RouteMetrics {
  href: string;
  loadTime: number;
  timestamp: number;
  fromCache: boolean;
  prefetched: boolean;
  priority: string;
}

interface PrefetchState {
  href: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
}

// Global route cache and prefetch state
const routeCache = new Map<string, { timestamp: number; data: Record<string, string | number | boolean> }>();
const prefetchQueue = new Map<string, PrefetchState>();
const routeMetrics: RouteMetrics[] = [];

// Performance monitor interface
interface RoutePerformanceMonitor {
  reportRouteMetrics?: (metrics: RouteMetrics) => void;
  reportPrefetchMetrics?: (metrics: { 
    totalPrefetched: number; 
    cacheHitRate: number; 
    averageLoadTime: number;
  }) => void;
}

declare global {
  interface Navigator {
    connection?: {
      effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
      downlink?: number;
      saveData?: boolean;
    };
  }
  
  interface Window {
    next?: {
      router?: {
        prefetch: (href: string) => Promise<void>;
      };
    };
    __webpack_require__?: {
      e: (chunkId: string) => Promise<void>;
    };
  }
}

// Smart prefetch manager
class PrefetchManager {
  private static instance: PrefetchManager;
  private prefetchCount = 0;
  private maxPrefetchCount = 10;
  private prefetchDelay = 100;
  private observer?: IntersectionObserver;
  private hoverTimeouts = new Map<string, number>();

  static getInstance(): PrefetchManager {
    if (!PrefetchManager.instance) {
      PrefetchManager.instance = new PrefetchManager();
    }
    return PrefetchManager.instance;
  }

  configure(options: { maxPrefetchCount?: number; prefetchDelay?: number }) {
    this.maxPrefetchCount = options.maxPrefetchCount || 10;
    this.prefetchDelay = options.prefetchDelay || 100;
  }

  shouldPrefetch(href: string): boolean {
    // Check if already prefetched or in queue
    if (prefetchQueue.has(href) || routeCache.has(href)) {
      return false;
    }

    // Check prefetch limits
    if (this.prefetchCount >= this.maxPrefetchCount) {
      return false;
    }

    // Check network conditions
    if (typeof navigator !== 'undefined' && navigator.connection) {
      const { effectiveType, saveData } = navigator.connection;
      
      if (saveData) return false;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') return false;
    }

    return true;
  }

  async prefetchRoute(href: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    if (!this.shouldPrefetch(href)) return;

    const startTime = performance.now();
    
    prefetchQueue.set(href, {
      href,
      timestamp: Date.now(),
      status: 'pending',
      priority
    });

    this.prefetchCount++;

    try {
      // Prefetch the route using Next.js router
      if (typeof window !== 'undefined' && window.next?.router) {
        await window.next.router.prefetch(href);
      }

      // Cache the prefetch result
      routeCache.set(href, {
        timestamp: Date.now(),
        data: { prefetched: true }
      });

      prefetchQueue.set(href, {
        ...prefetchQueue.get(href)!,
        status: 'completed'
      });

      // Report metrics
      const loadTime = performance.now() - startTime;
      this.reportPrefetchMetrics(href, loadTime, priority);

    } catch (error) {
      prefetchQueue.set(href, {
        ...prefetchQueue.get(href)!,
        status: 'failed'
      });
      
      console.warn('Prefetch failed for:', href, error);
    }
  }

  setupViewportPrefetch(): void {
    if (typeof window === 'undefined' || this.observer) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            const href = link.getAttribute('href');
            const priority = link.getAttribute('data-priority') as 'high' | 'medium' | 'low' || 'medium';
            
            if (href) {
              setTimeout(() => {
                this.prefetchRoute(href, priority);
              }, this.prefetchDelay);
            }
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    );
  }

  observeLink(element: HTMLAnchorElement): void {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  unobserveLink(element: HTMLAnchorElement): void {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  setupHoverPrefetch(element: HTMLAnchorElement, href: string, priority: 'high' | 'medium' | 'low'): () => void {
    const handleMouseEnter = () => {
      const timeout = setTimeout(() => {
        this.prefetchRoute(href, priority);
      }, this.prefetchDelay) as unknown as number;
      
      this.hoverTimeouts.set(href, timeout);
    };

    const handleMouseLeave = () => {
      const timeout = this.hoverTimeouts.get(href);
      if (timeout) {
        clearTimeout(timeout);
        this.hoverTimeouts.delete(href);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      const timeout = this.hoverTimeouts.get(href);
      if (timeout) {
        clearTimeout(timeout);
        this.hoverTimeouts.delete(href);
      }
    };
  }

  private reportPrefetchMetrics(href: string, loadTime: number, priority: string): void {
    const metrics: RouteMetrics = {
      href,
      loadTime,
      timestamp: Date.now(),
      fromCache: false,
      prefetched: true,
      priority
    };

    routeMetrics.push(metrics);

    // Report to global performance monitor
    if (typeof window !== 'undefined' && window.__performanceMonitor) {
      const monitor = window.__performanceMonitor as RoutePerformanceMonitor;
      if (monitor.reportRouteMetrics) {
        monitor.reportRouteMetrics(metrics);
      }
    }
  }

  getMetrics() {
    const totalPrefetched = routeMetrics.filter(m => m.prefetched).length;
    const cacheHits = routeMetrics.filter(m => m.fromCache).length;
    const cacheHitRate = routeMetrics.length > 0 ? (cacheHits / routeMetrics.length) * 100 : 0;
    const averageLoadTime = routeMetrics.length > 0 
      ? routeMetrics.reduce((sum, m) => sum + m.loadTime, 0) / routeMetrics.length 
      : 0;

    return {
      totalPrefetched,
      cacheHitRate,
      averageLoadTime,
      totalRoutes: routeMetrics.length,
      prefetchQueue: Array.from(prefetchQueue.values())
    };
  }

  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
    
    this.hoverTimeouts.forEach(timeout => clearTimeout(timeout));
    this.hoverTimeouts.clear();
  }
}

// Smart Link component with prefetch capabilities
export const SmartLink: React.FC<SmartLinkProps> = ({
  href,
  children,
  className,
  prefetch = 'hover',
  priority = 'medium',
  preload = [],
  onNavigate
}) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const prefetchManager = PrefetchManager.getInstance();

  useEffect(() => {
    const linkElement = linkRef.current;
    if (!linkElement) return;

    let cleanup: (() => void) | undefined;

    if (prefetch === 'viewport') {
      prefetchManager.observeLink(linkElement);
      
      return () => {
        prefetchManager.unobserveLink(linkElement);
      };
    } else if (prefetch === 'hover') {
      cleanup = prefetchManager.setupHoverPrefetch(linkElement, href, priority);
    } else if (prefetch === true) {
      // Immediate prefetch
      prefetchManager.prefetchRoute(href, priority);
    }

    return cleanup;
  }, [href, prefetch, priority]);

  // Preload additional resources
  useEffect(() => {
    if (preload.length === 0) return;

    preload.forEach(resourceType => {
      if (resourceType === 'scripts') {
        // Preload critical scripts for the route
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = `/_next/static/chunks/pages${href}.js`;
        document.head.appendChild(link);
      } else if (resourceType === 'styles') {
        // Preload critical styles for the route
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = `/_next/static/css/pages${href}.css`;
        document.head.appendChild(link);
      }
    });
  }, [href, preload]);

  const handleClick = useCallback(() => {
    const startTime = performance.now();
    
    // Check if route is cached
    const cached = routeCache.has(href);
    const prefetched = prefetchQueue.has(href);

    // Report navigation metrics
    const reportNavigation = () => {
      const loadTime = performance.now() - startTime;
      const metrics: RouteMetrics = {
        href,
        loadTime,
        timestamp: Date.now(),
        fromCache: cached,
        prefetched,
        priority
      };

      routeMetrics.push(metrics);

      if (typeof window !== 'undefined' && window.__performanceMonitor) {
        const monitor = window.__performanceMonitor as RoutePerformanceMonitor;
        if (monitor.reportRouteMetrics) {
          monitor.reportRouteMetrics(metrics);
        }
      }
    };

    // Set up navigation timing
    setTimeout(reportNavigation, 0);

    if (onNavigate) {
      onNavigate(href);
    }
  }, [href, priority, onNavigate]);

  return (
    <Link 
      ref={linkRef}
      href={href} 
      className={className}
      onClick={handleClick}
      data-priority={priority}
    >
      {children}
    </Link>
  );
};

// Smart Router Provider
export const SmartRouter: React.FC<SmartRouterProps> = ({
  children,
  prefetchStrategy = 'hover',
  prefetchDelay = 100,
  maxPrefetchCount = 10,
  enableAnalytics = true
}) => {
  const pathname = usePathname();
  const prefetchManager = PrefetchManager.getInstance();

  useEffect(() => {
    // Configure prefetch manager
    prefetchManager.configure({
      maxPrefetchCount,
      prefetchDelay
    });

    // Setup viewport prefetching if enabled
    if (prefetchStrategy === 'viewport') {
      prefetchManager.setupViewportPrefetch();
    }

    return () => {
      prefetchManager.cleanup();
    };
  }, [prefetchStrategy, prefetchDelay, maxPrefetchCount]);

  // Report analytics
  useEffect(() => {
    if (!enableAnalytics) return;

    const reportInterval = setInterval(() => {
      const metrics = prefetchManager.getMetrics();
      
      if (typeof window !== 'undefined' && window.__performanceMonitor) {
        const monitor = window.__performanceMonitor as RoutePerformanceMonitor;
        if (monitor.reportPrefetchMetrics) {
          monitor.reportPrefetchMetrics({
            totalPrefetched: metrics.totalPrefetched,
            cacheHitRate: metrics.cacheHitRate,
            averageLoadTime: metrics.averageLoadTime
          });
        }
      }
    }, 30000); // Report every 30 seconds

    return () => clearInterval(reportInterval);
  }, [enableAnalytics]);

  // Track route changes
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      console.log(`Route ${pathname} loaded in ${loadTime.toFixed(2)}ms`);
    };
  }, [pathname]);

  return <>{children}</>;
};

// Hook for route metrics
export function useRouteMetrics() {
  const [metrics, setMetrics] = React.useState(() => 
    PrefetchManager.getInstance().getMetrics()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(PrefetchManager.getInstance().getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Hook for smart navigation
export function useSmartNavigation() {
  const router = useRouter();
  const prefetchManager = PrefetchManager.getInstance();

  const navigateWithPrefetch = useCallback(async (href: string, priority: 'high' | 'medium' | 'low' = 'high') => {
    // Prefetch before navigation for instant loading
    await prefetchManager.prefetchRoute(href, priority);
    router.push(href);
  }, [router]);

  const preloadRoute = useCallback((href: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    return prefetchManager.prefetchRoute(href, priority);
  }, []);

  return {
    navigateWithPrefetch,
    preloadRoute,
    metrics: prefetchManager.getMetrics()
  };
}

export default SmartRouter;