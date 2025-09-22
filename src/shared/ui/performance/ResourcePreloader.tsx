import React, { useEffect, useCallback, useState } from 'react';

// Типы для предзагрузки ресурсов
interface PreloadResource {
  href: string;
  as: 'script' | 'style' | 'font' | 'image' | 'fetch' | 'document';
  type?: string;
  crossorigin?: 'anonymous' | 'use-credentials';
  media?: string;
  priority?: 'high' | 'low' | 'auto';
}

interface PreloadConfig {
  enableIntersectionObserver: boolean;
  enablePrefetch: boolean;
  enablePreconnect: boolean;
  enableDNSPrefetch: boolean;
  criticalResources: PreloadResource[];
  prefetchRoutes: string[];
  preconnectDomains: string[];
  dnsPrefetchDomains: string[];
}

interface PreloadMetrics {
  resourcesPreloaded: number;
  routesPrefetched: number;
  domainsPreconnected: number;
  dnsLookupsPrefetched: number;
  intersectionObserverActive: boolean;
  preloadErrors: number;
}

// Класс для управления предзагрузкой ресурсов
class ResourcePreloadManager {
  private observer: IntersectionObserver | null = null;
  private preloadedResources = new Set<string>();
  private prefetchedRoutes = new Set<string>();
  private preconnectedDomains = new Set<string>();
  private dnsPrefetchedDomains = new Set<string>();
  private metrics: PreloadMetrics = {
    resourcesPreloaded: 0,
    routesPrefetched: 0,
    domainsPreconnected: 0,
    dnsLookupsPrefetched: 0,
    intersectionObserverActive: false,
    preloadErrors: 0
  };

  constructor(private config: PreloadConfig) {
    this.initializePreloading();
  }

  private initializePreloading(): void {
    // Предзагрузка критических ресурсов
    this.preloadCriticalResources();
    
    // Настройка preconnect и dns-prefetch
    this.setupDomainOptimizations();
    
    // Настройка Intersection Observer для ленивой предзагрузки
    if (this.config.enableIntersectionObserver) {
      this.setupIntersectionObserver();
    }
    
    // Предзагрузка маршрутов
    if (this.config.enablePrefetch) {
      this.prefetchRoutes();
    }
  }

  private preloadCriticalResources(): void {
    this.config.criticalResources.forEach(resource => {
      this.preloadResource(resource);
    });
  }

  private preloadResource(resource: PreloadResource): void {
    if (this.preloadedResources.has(resource.href)) {
      return;
    }

    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      
      if (resource.type) link.type = resource.type;
      if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
      if (resource.media) link.media = resource.media;
      
      // Добавляем priority hint если поддерживается
      if (resource.priority && 'fetchPriority' in link) {
        (link as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = resource.priority;
      }

      link.onload = () => {
        this.metrics.resourcesPreloaded++;
        this.preloadedResources.add(resource.href);
      };

      link.onerror = () => {
        this.metrics.preloadErrors++;
        console.warn(`Failed to preload resource: ${resource.href}`);
      };

      document.head.appendChild(link);
    } catch (error) {
      this.metrics.preloadErrors++;
      console.error('Error preloading resource:', error);
    }
  }

  private setupDomainOptimizations(): void {
    // DNS prefetch
    if (this.config.enableDNSPrefetch) {
      this.config.dnsPrefetchDomains.forEach(domain => {
        this.addDNSPrefetch(domain);
      });
    }

    // Preconnect
    if (this.config.enablePreconnect) {
      this.config.preconnectDomains.forEach(domain => {
        this.addPreconnect(domain);
      });
    }
  }

  private addDNSPrefetch(domain: string): void {
    if (this.dnsPrefetchedDomains.has(domain)) return;

    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
    
    this.dnsPrefetchedDomains.add(domain);
    this.metrics.dnsLookupsPrefetched++;
  }

  private addPreconnect(domain: string): void {
    if (this.preconnectedDomains.has(domain)) return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = `//${domain}`;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    
    this.preconnectedDomains.add(domain);
    this.metrics.domainsPreconnected++;
  }

  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const href = element.getAttribute('data-preload-href');
            const as = element.getAttribute('data-preload-as') as PreloadResource['as'];
            
            if (href && as) {
              this.preloadResource({ href, as });
              this.observer?.unobserve(element);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    this.metrics.intersectionObserverActive = true;
  }

  private prefetchRoutes(): void {
    this.config.prefetchRoutes.forEach(route => {
      this.prefetchRoute(route);
    });
  }

  private prefetchRoute(route: string): void {
    if (this.prefetchedRoutes.has(route)) return;

    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      
      link.onload = () => {
        this.metrics.routesPrefetched++;
        this.prefetchedRoutes.add(route);
      };

      link.onerror = () => {
        this.metrics.preloadErrors++;
        console.warn(`Failed to prefetch route: ${route}`);
      };

      document.head.appendChild(link);
    } catch (error) {
      this.metrics.preloadErrors++;
      console.error('Error prefetching route:', error);
    }
  }

  public observeElement(element: HTMLElement): void {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  public unobserveElement(element: HTMLElement): void {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  public getMetrics(): PreloadMetrics {
    return { ...this.metrics };
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.metrics.intersectionObserverActive = false;
    }
  }
}

// Хук для использования предзагрузки ресурсов
export const useResourcePreloader = (config: Partial<PreloadConfig> = {}) => {
  const [manager, setManager] = useState<ResourcePreloadManager | null>(null);
  const [metrics, setMetrics] = useState<PreloadMetrics>({
    resourcesPreloaded: 0,
    routesPrefetched: 0,
    domainsPreconnected: 0,
    dnsLookupsPrefetched: 0,
    intersectionObserverActive: false,
    preloadErrors: 0
  });

  const defaultConfig: PreloadConfig = {
    enableIntersectionObserver: true,
    enablePrefetch: true,
    enablePreconnect: true,
    enableDNSPrefetch: true,
    criticalResources: [],
    prefetchRoutes: [],
    preconnectDomains: ['fonts.googleapis.com', 'fonts.gstatic.com'],
    dnsPrefetchDomains: ['google-analytics.com', 'googletagmanager.com']
  };

  const finalConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    const preloadManager = new ResourcePreloadManager(finalConfig);
    setManager(preloadManager);

    // Обновляем метрики каждые 2 секунды
    const metricsInterval = setInterval(() => {
      setMetrics(preloadManager.getMetrics());
    }, 2000);

    return () => {
      clearInterval(metricsInterval);
      preloadManager.destroy();
    };
  }, []);

  const preloadResource = useCallback((resource: PreloadResource) => {
    if (manager) {
      manager['preloadResource'](resource);
    }
  }, [manager]);

  const observeElement = useCallback((element: HTMLElement) => {
    if (manager) {
      manager.observeElement(element);
    }
  }, [manager]);

  const unobserveElement = useCallback((element: HTMLElement) => {
    if (manager) {
      manager.unobserveElement(element);
    }
  }, [manager]);

  return {
    preloadResource,
    observeElement,
    unobserveElement,
    metrics,
    isActive: !!manager
  };
};

// Компонент для отображения метрик предзагрузки
const PreloadMetricsComponent: React.FC<{ metrics: PreloadMetrics }> = ({ metrics }) => {
  return (
    <div className="preload-metrics">
      <h3>Resource Preload Metrics</h3>
      <div className="metrics-grid">
        <div className="metric">
          <span className="metric-label">Resources Preloaded:</span>
          <span className="metric-value">{metrics.resourcesPreloaded}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Routes Prefetched:</span>
          <span className="metric-value">{metrics.routesPrefetched}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Domains Preconnected:</span>
          <span className="metric-value">{metrics.domainsPreconnected}</span>
        </div>
        <div className="metric">
          <span className="metric-label">DNS Prefetched:</span>
          <span className="metric-value">{metrics.dnsLookupsPrefetched}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Intersection Observer:</span>
          <span className={`metric-value ${metrics.intersectionObserverActive ? 'active' : 'inactive'}`}>
            {metrics.intersectionObserverActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Preload Errors:</span>
          <span className={`metric-value ${metrics.preloadErrors > 0 ? 'error' : ''}`}>
            {metrics.preloadErrors}
          </span>
        </div>
      </div>
    </div>
  );
};

// HOC для автоматической предзагрузки ресурсов
export const withResourcePreloader = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  preloadConfig: Partial<PreloadConfig> = {}
) => {
  const WrappedWithPreloader = React.forwardRef<HTMLDivElement, P>((props, ref) => {
    const { metrics } = useResourcePreloader(preloadConfig);

    return (
      <div className="resource-preloader-wrapper" ref={ref}>
        <WrappedComponent {...(props as P)} />
        {process.env.NODE_ENV === 'development' && (
          <PreloadMetricsComponent metrics={metrics} />
        )}
      </div>
    );
  });

  WrappedWithPreloader.displayName = `withResourcePreloader(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WrappedWithPreloader;
};

// Главный компонент ResourcePreloader
const ResourcePreloader: React.FC<{ config?: Partial<PreloadConfig> }> = ({ 
  config = {} 
}) => {
  const { metrics, isActive } = useResourcePreloader(config);

  if (!isActive) {
    return null;
  }

  return (
    <div className="resource-preloader">
      {process.env.NODE_ENV === 'development' && (
          <PreloadMetricsComponent metrics={metrics} />
        )}
    </div>
  );
};

export default ResourcePreloader;
export type { PreloadResource, PreloadConfig, PreloadMetrics };