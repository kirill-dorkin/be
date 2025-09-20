'use client';

import { onCLS, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface WebVitalsMetric extends Metric {
  label: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface PerformanceData {
  url: string;
  timestamp: number;
  userAgent: string;
  connectionType: string;
  metrics: WebVitalsMetric[];
}

class WebVitalsMonitor {
  private metrics: WebVitalsMetric[] = [];
  private isInitialized = false;
  private analyticsEndpoint = '/api/analytics/web-vitals';

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  public init() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;

    // Инициализация всех метрик Web Vitals
    onCLS(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));

    // Отправка данных при закрытии страницы
    window.addEventListener('beforeunload', this.sendMetrics.bind(this));
    
    // Отправка данных при скрытии страницы (для мобильных устройств)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendMetrics();
      }
    });
  }

  private handleMetric(metric: Metric) {
    const enhancedMetric: WebVitalsMetric = {
      ...metric,
      label: this.getMetricLabel(metric.name),
      rating: this.getMetricRating(metric.name, metric.value),
    };

    this.metrics.push(enhancedMetric);
    
    // Логирование в консоль для разработки
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${enhancedMetric.label}:`, {
        value: metric.value,
        rating: enhancedMetric.rating,
        delta: metric.delta,
      });
    }

    // Отправка критических метрик немедленно
    if (this.isCriticalMetric(metric.name, enhancedMetric.rating)) {
      this.sendMetric(enhancedMetric);
    }
  }

  private getMetricLabel(name: string): string {
    const labels: Record<string, string> = {
      CLS: 'Cumulative Layout Shift',
      FCP: 'First Contentful Paint',
      FID: 'First Input Delay',
      LCP: 'Largest Contentful Paint',
      TTFB: 'Time to First Byte',
    };
    return labels[name] || name;
  }

  private getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      CLS: [0.1, 0.25],
      FCP: [1800, 3000],
      FID: [100, 300],
      LCP: [2500, 4000],
      TTFB: [800, 1800],
    };

    const [good, poor] = thresholds[name] || [0, 0];
    
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  private isCriticalMetric(name: string, rating: string): boolean {
    // Отправляем немедленно плохие метрики LCP и CLS
    return (name === 'LCP' || name === 'CLS') && rating === 'poor';
  }

  private getConnectionType(): string {
    // @ts-expect-error - navigator.connection может не существовать
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  private async sendMetric(metric: WebVitalsMetric) {
    try {
      const data: PerformanceData = {
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        connectionType: this.getConnectionType(),
        metrics: [metric],
      };

      // Используем sendBeacon для надежной отправки
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          this.analyticsEndpoint,
          JSON.stringify(data)
        );
      } else {
        // Fallback для старых браузеров
        fetch(this.analyticsEndpoint, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
          keepalive: true,
        }).catch(() => {
          // Игнорируем ошибки отправки аналитики
        });
      }
    } catch {
      // Игнорируем ошибки отправки
    }
  }

  private async sendMetrics() {
    if (this.metrics.length === 0) return;

    const data: PerformanceData = {
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      metrics: this.metrics,
    };

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          this.analyticsEndpoint,
          JSON.stringify(data)
        );
      } else {
        await fetch(this.analyticsEndpoint, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
          keepalive: true,
        });
      }
    } catch {
        // Игнорируем ошибки аналитики
      }

    // Очищаем метрики после отправки
    this.metrics = [];
  }

  // Публичные методы для получения текущих метрик
  getMetrics(): WebVitalsMetric[] {
    return [...this.metrics];
  }

  // Получение сводки производительности
  getPerformanceSummary() {
    const summary = {
      good: 0,
      needsImprovement: 0,
      poor: 0,
      total: this.metrics.length,
    };

    this.metrics.forEach((metric) => {
      switch (metric.rating) {
        case 'good':
          summary.good++;
          break;
        case 'needs-improvement':
          summary.needsImprovement++;
          break;
        case 'poor':
          summary.poor++;
          break;
      }
    });

    return summary;
  }

  // Принудительная отправка метрик
  flush() {
    this.sendMetrics();
  }
}

// Дополнительные метрики производительности
export class CustomPerformanceMetrics {
  static measureResourceTiming() {
    if (typeof window === 'undefined' || !('performance' in window)) return [];

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.map((resource) => ({
      name: resource.name,
      type: this.getResourceType(resource.name),
      duration: resource.duration,
      size: resource.transferSize || 0,
      cached: resource.transferSize === 0 && resource.decodedBodySize > 0,
    }));
  }

  static getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    return 'other';
  }

  static measurePageLoad() {
    if (typeof window === 'undefined' || !('performance' in window)) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) return null;

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ssl: navigation.secureConnectionStart > 0 
        ? navigation.connectEnd - navigation.secureConnectionStart 
        : 0,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
      domParse: navigation.domContentLoadedEventStart - navigation.responseEnd,
      domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      total: navigation.loadEventEnd - navigation.startTime,
    };
  }

  static measureMemoryUsage() {
    // @ts-expect-error - performance.memory может не существовать
    const memory = performance.memory;
    
    if (!memory) return null;

    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }
}

// Синглтон для глобального использования
export const webVitalsMonitor = new WebVitalsMonitor();

// Хук для использования в React компонентах
export const useWebVitals = () => {
  return {
    monitor: webVitalsMonitor,
    metrics: webVitalsMonitor.getMetrics(),
    summary: webVitalsMonitor.getPerformanceSummary(),
  };
};

export default webVitalsMonitor;