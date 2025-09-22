'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Типы для мониторинга производительности
export interface PerformanceMetrics {
  lcp: number | null;
  inp: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
}

export interface ResourceMetrics {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  fontSize: number;
  loadTime: number;
  cacheHitRate: number;
}

// Утилиты для оптимизации производительности
export const performanceOptimizationUtils = {
  // Мониторинг Core Web Vitals
  measureWebVitals: (): Promise<PerformanceMetrics> => {
    return new Promise((resolve) => {
      const metrics: PerformanceMetrics = {
        lcp: null,
        inp: null,
        cls: null,
        ttfb: null,
        fcp: null
      };

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        metrics.lcp = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Interaction to Next Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          metrics.inp = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['event'] });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        metrics.cls = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });

      // Time to First Byte
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.ttfb = navigation.responseStart - navigation.requestStart;
      }

      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            metrics.fcp = entry.startTime;
          }
        });
      }).observe({ entryTypes: ['paint'] });

      // Interaction to Next Paint (INP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          metrics.inp = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['event'] });

      // Возвращаем метрики через 3 секунды
      setTimeout(() => resolve(metrics), 3000);
    });
  },

  // Анализ ресурсов
  analyzeResources: (): ResourceMetrics => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;
    let fontSize = 0;
    let cachedResources = 0;
    let totalLoadTime = 0;

    resources.forEach((resource) => {
      const size = resource.transferSize || 0;
      totalSize += size;
      totalLoadTime += resource.responseEnd - resource.requestStart;

      if (resource.transferSize === 0) {
        cachedResources++;
      }

      if (resource.name.endsWith('.js')) {
        jsSize += size;
      } else if (resource.name.endsWith('.css')) {
        cssSize += size;
      } else if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(resource.name)) {
        imageSize += size;
      } else if (/\.(woff|woff2|ttf|otf)$/i.test(resource.name)) {
        fontSize += size;
      }
    });

    return {
      totalSize,
      jsSize,
      cssSize,
      imageSize,
      fontSize,
      loadTime: totalLoadTime / resources.length,
      cacheHitRate: resources.length > 0 ? cachedResources / resources.length : 0
    };
  },

  // Оптимизация изображений
  optimizeImages: () => {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      // Lazy loading
      if (!img.loading) {
        img.loading = 'lazy';
      }

      // Добавление sizes для responsive images
      if (!img.sizes && img.srcset) {
        img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
      }

      // Preload для критических изображений
      if (img.getBoundingClientRect().top < window.innerHeight) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
      }
    });
  },

  // Оптимизация шрифтов
  optimizeFonts: () => {
    const fontLinks = document.querySelectorAll('link[rel="stylesheet"]');
    fontLinks.forEach((link) => {
      if (link.getAttribute('href')?.includes('fonts.googleapis.com')) {
        link.setAttribute('rel', 'preload');
        link.setAttribute('as', 'style');
        link.setAttribute('onload', "this.onload=null;this.rel='stylesheet'");
      }
    });
  },

  // Предзагрузка критических ресурсов
  preloadCriticalResources: (resources: string[]) => {
    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (/\.(woff|woff2)$/.test(resource)) {
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      } else if (/\.(jpg|jpeg|png|webp|avif)$/.test(resource)) {
        link.as = 'image';
      }
      
      link.href = resource;
      document.head.appendChild(link);
    });
  },

  // Мониторинг памяти
  monitorMemory: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  },

  // Оптимизация рендеринга
  optimizeRendering: () => {
    // Включение CSS containment
    const style = document.createElement('style');
    style.textContent = `
      .optimize-rendering {
        contain: layout style paint;
        content-visibility: auto;
        contain-intrinsic-size: 0 500px;
      }
      
      .optimize-rendering img {
        content-visibility: auto;
        contain-intrinsic-size: 300px 200px;
      }
    `;
    document.head.appendChild(style);

    // Применение оптимизаций к элементам
    const containers = document.querySelectorAll('[data-optimize]');
    containers.forEach((container) => {
      container.classList.add('optimize-rendering');
    });
  }
};

// Хук для мониторинга производительности
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [resources, setResources] = useState<ResourceMetrics | null>(null);
  const [memory, setMemory] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startMonitoring = useCallback(async () => {
    // Измеряем Web Vitals
    const webVitals = await performanceOptimizationUtils.measureWebVitals();
    setMetrics(webVitals);

    // Анализируем ресурсы
    const resourceMetrics = performanceOptimizationUtils.analyzeResources();
    setResources(resourceMetrics);

    // Мониторим память каждые 5 секунд
    intervalRef.current = setInterval(() => {
      const memoryInfo = performanceOptimizationUtils.monitorMemory();
      setMemory(memoryInfo);
    }, 5000);
  }, []);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    startMonitoring();
    return stopMonitoring;
  }, [startMonitoring, stopMonitoring]);

  return {
    metrics,
    resources,
    memory,
    startMonitoring,
    stopMonitoring,
    optimizeImages: performanceOptimizationUtils.optimizeImages,
    optimizeFonts: performanceOptimizationUtils.optimizeFonts,
    preloadResources: performanceOptimizationUtils.preloadCriticalResources
  };
};

// Компонент для отображения метрик производительности
export const PerformanceMonitor = () => {
  const { metrics, resources, memory } = usePerformanceMonitoring();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold mb-2">Performance Monitor</div>
      
      {metrics && (
        <div className="mb-3">
          <div className="font-semibold text-blue-300">Core Web Vitals</div>
          <div>LCP: {metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : 'N/A'}</div>
          <div>INP: {metrics.inp ? `${metrics.inp.toFixed(0)}ms` : 'N/A'}</div>
          <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}</div>
          <div>TTFB: {metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : 'N/A'}</div>
          <div>FCP: {metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : 'N/A'}</div>
        </div>
      )}

      {resources && (
        <div className="mb-3">
          <div className="font-semibold text-green-300">Resources</div>
          <div>Total: {(resources.totalSize / 1024).toFixed(1)}KB</div>
          <div>JS: {(resources.jsSize / 1024).toFixed(1)}KB</div>
          <div>CSS: {(resources.cssSize / 1024).toFixed(1)}KB</div>
          <div>Images: {(resources.imageSize / 1024).toFixed(1)}KB</div>
          <div>Cache Hit: {(resources.cacheHitRate * 100).toFixed(1)}%</div>
        </div>
      )}

      {memory && (
        <div>
          <div className="font-semibold text-yellow-300">Memory</div>
          <div>Used: {(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
          <div>Total: {(memory.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
          <div>Usage: {memory.usagePercentage.toFixed(1)}%</div>
        </div>
      )}
    </div>
  );
};

// Компонент для автоматической оптимизации
export const PerformanceOptimizer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Применяем оптимизации при монтировании
    performanceOptimizationUtils.optimizeImages();
    performanceOptimizationUtils.optimizeFonts();
    performanceOptimizationUtils.optimizeRendering();

    // Предзагружаем критические ресурсы
    const criticalResources = [
      '/_next/static/css/app.css',
      '/_next/static/chunks/main.js'
    ];
    performanceOptimizationUtils.preloadCriticalResources(criticalResources);
  }, []);

  return <>{children}</>;
};

// Экспорт по умолчанию
export default {
  utils: performanceOptimizationUtils,
  hooks: { usePerformanceMonitoring },
  components: { PerformanceMonitor, PerformanceOptimizer }
};