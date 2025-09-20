'use client';

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

// Интерфейсы для роутинга
export interface RouteConfig {
  path: string;
  priority: 'high' | 'medium' | 'low';
  prefetchStrategy: 'eager' | 'lazy' | 'viewport' | 'hover' | 'intent';
  cacheStrategy: 'static' | 'dynamic' | 'revalidate';
  preloadData?: boolean;
  dependencies?: string[];
}

export interface RouteMetrics {
  totalRoutes: number;
  prefetchedRoutes: number;
  cacheHits: number;
  cacheMisses: number;
  averageLoadTime: number;
  navigationCount: number;
  routeErrors: number;
}

export interface PrefetchOptions {
  priority?: 'high' | 'low';
  preloadData?: boolean;
  timeout?: number;
  retries?: number;
}

// Менеджер роутинга и предзагрузки
class RoutePerformanceManager {
  private routes: Map<string, RouteConfig> = new Map();
  private prefetchCache: Map<string, Promise<void>> = new Map();
  private metrics: RouteMetrics = {
    totalRoutes: 0,
    prefetchedRoutes: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageLoadTime: 0,
    navigationCount: 0,
    routeErrors: 0
  };
  private loadTimes: number[] = [];
  private intersectionObserver?: IntersectionObserver;
  private hoverTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor() {
    this.initializeIntersectionObserver();
    this.initializeRouteConfigs();
  }

  private initializeIntersectionObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const link = entry.target as HTMLAnchorElement;
              const href = link.getAttribute('href');
              if (href) {
                this.prefetchRoute(href, { priority: 'low' });
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
  }

  private initializeRouteConfigs() {
    // Конфигурация основных роутов
    const defaultRoutes: RouteConfig[] = [
      {
        path: '/',
        priority: 'high',
        prefetchStrategy: 'eager',
        cacheStrategy: 'static',
        preloadData: true
      },
      {
        path: '/request',
        priority: 'high',
        prefetchStrategy: 'eager',
        cacheStrategy: 'dynamic',
        preloadData: true
      },
      {
        path: '/worker/my-tasks',
        priority: 'medium',
        prefetchStrategy: 'lazy',
        cacheStrategy: 'dynamic',
        preloadData: true
      },
      {
        path: '/admin/dashboard',
        priority: 'medium',
        prefetchStrategy: 'hover',
        cacheStrategy: 'dynamic',
        preloadData: true
      },
      {
        path: '/login',
        priority: 'low',
        prefetchStrategy: 'viewport',
        cacheStrategy: 'static'
      }
    ];

    defaultRoutes.forEach(route => {
      this.routes.set(route.path, route);
      this.metrics.totalRoutes++;
    });
  }

  async prefetchRoute(path: string, options: PrefetchOptions = {}): Promise<void> {
    const cacheKey = `${path}-${JSON.stringify(options)}`;
    
    // Проверяем кэш
    if (this.prefetchCache.has(cacheKey)) {
      this.metrics.cacheHits++;
      return this.prefetchCache.get(cacheKey);
    }

    this.metrics.cacheMisses++;
    
    const prefetchPromise = this.performPrefetch(path, options);
    this.prefetchCache.set(cacheKey, prefetchPromise);
    
    try {
      await prefetchPromise;
      this.metrics.prefetchedRoutes++;
    } catch (error) {
      this.metrics.routeErrors++;
      console.error('Route prefetch failed:', error);
      this.prefetchCache.delete(cacheKey);
    }

    return prefetchPromise;
  }

  private async performPrefetch(path: string, options: PrefetchOptions): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Use Next.js router prefetch
      if (typeof window !== 'undefined') {
        const windowWithNext = window as Window & { next?: { router?: { prefetch: (path: string) => Promise<void> } } };
        const router = windowWithNext.next?.router;
        if (router && router.prefetch) {
          await router.prefetch(path);
        } else {
          // Fallback: create link element for prefetch
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = path;
          document.head.appendChild(link);
          
          // Remove after timeout
          setTimeout(() => {
            if (link.parentNode) {
              link.parentNode.removeChild(link);
            }
          }, 5000);
        }
      }
      
      if (options.preloadData) {
        await this.preloadRouteData(path);
      }

      const loadTime = performance.now() - startTime;
      this.loadTimes.push(loadTime);
      this.updateAverageLoadTime();
      
    } catch (error) {
      throw new Error(`Failed to prefetch route ${path}: ${error}`);
    }
  }

  private async preloadRouteData(path: string): Promise<void> {
    // Предзагрузка данных для конкретных роутов
    const dataEndpoints: Record<string, string> = {
      '/worker/my-tasks': '/api/tasks',
      '/admin/dashboard': '/api/admin/stats',
      '/request': '/api/services'
    };

    const endpoint = dataEndpoints[path];
    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: 'HEAD', // Только заголовки для проверки доступности
          cache: 'force-cache'
        });
        
        if (response.ok) {
          // Данные доступны, можно предзагрузить
          await fetch(endpoint, { cache: 'force-cache' });
        }
      } catch (error) {
        console.warn(`Failed to preload data for ${path}:`, error);
      }
    }
  }

  private updateAverageLoadTime() {
    if (this.loadTimes.length > 0) {
      const sum = this.loadTimes.reduce((a, b) => a + b, 0);
      this.metrics.averageLoadTime = sum / this.loadTimes.length;
      
      // Ограничиваем историю последними 100 измерениями
      if (this.loadTimes.length > 100) {
        this.loadTimes = this.loadTimes.slice(-100);
      }
    }
  }

  observeLink(element: HTMLAnchorElement) {
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(element);
    }
  }

  unobserveLink(element: HTMLAnchorElement) {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
  }

  handleLinkHover(path: string) {
    const route = this.routes.get(path);
    if (route?.prefetchStrategy === 'hover' || route?.prefetchStrategy === 'intent') {
      // Задержка для intent-based prefetch
      const delay = route.prefetchStrategy === 'intent' ? 150 : 50;
      
      const timeout = setTimeout(() => {
        this.prefetchRoute(path, { priority: 'high' });
      }, delay);
      
      this.hoverTimeouts.set(path, timeout);
    }
  }

  handleLinkLeave(path: string) {
    const timeout = this.hoverTimeouts.get(path);
    if (timeout) {
      clearTimeout(timeout);
      this.hoverTimeouts.delete(path);
    }
  }

  recordNavigation() {
    this.metrics.navigationCount++;
  }

  getMetrics(): RouteMetrics {
    return { ...this.metrics };
  }

  getRouteConfig(path: string): RouteConfig | undefined {
    return this.routes.get(path);
  }

  addRoute(config: RouteConfig) {
    this.routes.set(config.path, config);
    this.metrics.totalRoutes++;
  }

  cleanup() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.hoverTimeouts.forEach(timeout => clearTimeout(timeout));
    this.hoverTimeouts.clear();
    this.prefetchCache.clear();
  }
}

// Singleton instance
let routeManager: RoutePerformanceManager | null = null;

function getRouteManager(): RoutePerformanceManager {
  if (!routeManager) {
    routeManager = new RoutePerformanceManager();
  }
  return routeManager;
}

// Hook для использования роутинга
export function useRouteOptimizer() {
  const router = useRouter();
  const pathname = usePathname();
  const manager = useMemo(() => getRouteManager(), []);

  const prefetchRoute = useCallback(async (path: string, options?: PrefetchOptions) => {
    return manager.prefetchRoute(path, options);
  }, [manager]);

  const navigate = useCallback((path: string) => {
    manager.recordNavigation();
    router.push(path);
  }, [router, manager]);

  const getMetrics = useCallback(() => {
    return manager.getMetrics();
  }, [manager]);

  const addRoute = useCallback((config: RouteConfig) => {
    manager.addRoute(config);
  }, [manager]);

  useEffect(() => {
    // Предзагрузка критических роутов при инициализации
    const criticalRoutes = ['/', '/request'];
    criticalRoutes.forEach(route => {
      if (route !== pathname) {
        prefetchRoute(route, { priority: 'high' });
      }
    });

    return () => {
      manager.cleanup();
    };
  }, [pathname, prefetchRoute, manager]);

  return {
    prefetchRoute,
    navigate,
    getMetrics,
    addRoute,
    currentPath: pathname
  };
}

// Оптимизированный Link компонент
interface OptimizedLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: React.ReactNode;
  prefetchStrategy?: 'eager' | 'lazy' | 'viewport' | 'hover' | 'intent';
  priority?: 'high' | 'low';
}

export const OptimizedLink: React.FC<OptimizedLinkProps> = ({
  href,
  children,
  prefetchStrategy = 'lazy',
  priority = 'low',
  className,
  ...props
}) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const manager = useMemo(() => getRouteManager(), []);

  useEffect(() => {
    const linkElement = linkRef.current;
    if (!linkElement) return;

    // Настройка стратегии предзагрузки
    if (prefetchStrategy === 'eager') {
      manager.prefetchRoute(href, { priority });
    } else if (prefetchStrategy === 'viewport') {
      manager.observeLink(linkElement);
    }

    return () => {
      if (prefetchStrategy === 'viewport' && linkElement) {
        manager.unobserveLink(linkElement);
      }
    };
  }, [href, prefetchStrategy, priority, manager]);

  const handleMouseEnter = useCallback(() => {
    if (prefetchStrategy === 'hover' || prefetchStrategy === 'intent') {
      manager.handleLinkHover(href);
    }
  }, [href, prefetchStrategy, manager]);

  const handleMouseLeave = useCallback(() => {
    if (prefetchStrategy === 'hover' || prefetchStrategy === 'intent') {
      manager.handleLinkLeave(href);
    }
  }, [href, prefetchStrategy, manager]);

  const handleClick = useCallback(() => {
    manager.recordNavigation();
  }, [manager]);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      prefetch={prefetchStrategy === 'eager'}
      {...props}
    >
      {children}
    </Link>
  );
};

// Компонент для отображения метрик роутинга
interface RouteMetricsProps {
  metrics: RouteMetrics;
}

const RouteMetricsComponent: React.FC<RouteMetricsProps> = ({ metrics }) => (
  <div className="route-metrics p-4 bg-gray-100 rounded-lg">
    <h3 className="text-lg font-semibold mb-2">Route Performance Metrics</h3>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>Total Routes: {metrics.totalRoutes}</div>
      <div>Prefetched: {metrics.prefetchedRoutes}</div>
      <div>Cache Hits: {metrics.cacheHits}</div>
      <div>Cache Misses: {metrics.cacheMisses}</div>
      <div>Avg Load Time: {metrics.averageLoadTime.toFixed(2)}ms</div>
      <div>Navigations: {metrics.navigationCount}</div>
    </div>
  </div>
);

// Основной компонент оптимизатора роутинга
export const RouteOptimizer: React.FC = () => {
  const { getMetrics } = useRouteOptimizer();
  const [metrics, setMetrics] = React.useState<RouteMetrics>(() => getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [getMetrics]);

  return (
    <div className="route-optimizer">
      {process.env.NODE_ENV === 'development' && (
        <RouteMetricsComponent metrics={metrics} />
      )}
    </div>
  );
};

// HOC для автоматической оптимизации роутинга
export function withRouteOptimization<P extends object>(
  Component: React.ComponentType<P>,
  routeConfig?: Partial<RouteConfig>
) {
  const WrappedComponent = React.forwardRef<HTMLElement, P>((props, ref) => {
    const { addRoute, currentPath } = useRouteOptimizer();
    
    useEffect(() => {
      if (routeConfig) {
        addRoute({
          path: currentPath,
          priority: 'medium',
          prefetchStrategy: 'lazy',
          cacheStrategy: 'dynamic',
          ...routeConfig
        });
      }
    }, [addRoute, currentPath]);

    return <Component {...(props as P)} ref={ref} />;
  });

  WrappedComponent.displayName = `withRouteOptimization(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default RouteOptimizer;