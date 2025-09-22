import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType?: string;
}

export interface PerformanceConfig {
  enableAnalytics: boolean;
  enableConsoleLogging: boolean;
  enableLocalStorage: boolean;
  analyticsEndpoint?: string;
  sampleRate: number;
  thresholds: {
    lcp: { good: number; poor: number };
    inp: { good: number; poor: number };
    cls: { good: number; poor: number };
    fcp: { good: number; poor: number };
    ttfb: { good: number; poor: number };
  };
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableAnalytics: process.env.NODE_ENV === 'production',
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableLocalStorage: true,
  analyticsEndpoint: '/api/analytics/performance',
  sampleRate: 1.0, // 100% в dev, можно снизить в prod
  thresholds: {
    lcp: { good: 2500, poor: 4000 },
    inp: { good: 200, poor: 500 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1800, poor: 3000 },
    ttfb: { good: 800, poor: 1800 }
  }
};

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private isInitialized = false;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.isInitialized = true;

    // Регистрируем глобальный монитор
    (window as any).__performanceMonitor = this;

    // Инициализируем сбор метрик
    this.setupWebVitals();
    this.setupNavigationObserver();
    this.setupResourceObserver();

    // Восстанавливаем метрики из localStorage
    if (this.config.enableLocalStorage) {
      this.loadMetricsFromStorage();
    }

    if (this.config.enableConsoleLogging) {
      console.log('Performance Monitor initialized', this.config);
    }
  }

  private setupWebVitals() {
    const handleMetric = (metric: any) => {
      if (Math.random() > this.config.sampleRate) return;

      const performanceMetric: PerformanceMetric = {
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: this.getRating(metric.name, metric.value),
        delta: metric.delta,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        connectionType: this.getConnectionType()
      };

      this.addMetric(performanceMetric);
    };

    // Собираем Core Web Vitals
    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);
  }

  private setupNavigationObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            
            // Добавляем метрики навигации
            this.addMetric({
              id: `nav-${Date.now()}`,
              name: 'navigation',
              value: navEntry.loadEventEnd - navEntry.loadEventStart,
              rating: 'good',
              delta: 0,
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent,
              connectionType: this.getConnectionType()
            });
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        if (this.config.enableConsoleLogging) {
          console.warn('Navigation observer not supported:', error);
        }
      }
    }
  }

  private setupResourceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Отслеживаем только крупные ресурсы
            if ((resourceEntry as any).transferSize > 50000) { // > 50KB
              this.addMetric({
                id: `resource-${Date.now()}-${Math.random()}`,
                name: 'large-resource',
                value: (resourceEntry as any).transferSize,
                rating: this.getRating('resource-size', (resourceEntry as any).transferSize),
                delta: 0,
                timestamp: Date.now(),
                url: resourceEntry.name,
                userAgent: navigator.userAgent,
                connectionType: this.getConnectionType()
              });
            }
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        if (this.config.enableConsoleLogging) {
          console.warn('Resource observer not supported:', error);
        }
      }
    }
  }

  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = this.config.thresholds;
    
    let threshold;
    switch (metricName.toLowerCase()) {
      case 'lcp':
        threshold = thresholds.lcp;
        break;
      case 'inp':
        threshold = thresholds.inp;
        break;
      case 'cls':
        threshold = thresholds.cls;
        break;
      case 'fcp':
        threshold = thresholds.fcp;
        break;
      case 'ttfb':
        threshold = thresholds.ttfb;
        break;
      case 'resource-size':
        return value > 200000 ? 'poor' : value > 100000 ? 'needs-improvement' : 'good';
      default:
        return 'good';
    }

    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      return (navigator as any).connection?.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Ограничиваем количество метрик в памяти
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    if (this.config.enableConsoleLogging) {
      console.log('Performance metric:', metric);
    }

    if (this.config.enableLocalStorage) {
      this.saveMetricsToStorage();
    }

    if (this.config.enableAnalytics && this.config.analyticsEndpoint) {
      this.sendToAnalytics([metric]);
    }

    // Диспатчим кастомное событие для реактивности
    window.dispatchEvent(new CustomEvent('performance-metric', { detail: metric }));
  }

  private saveMetricsToStorage() {
    try {
      const recentMetrics = this.metrics.slice(-100); // Сохраняем только последние 100
      localStorage.setItem('performance-metrics', JSON.stringify(recentMetrics));
    } catch (error) {
      if (this.config.enableConsoleLogging) {
        console.warn('Failed to save metrics to localStorage:', error);
      }
    }
  }

  private loadMetricsFromStorage() {
    try {
      const stored = localStorage.getItem('performance-metrics');
      if (stored) {
        const metrics = JSON.parse(stored);
        this.metrics = Array.isArray(metrics) ? metrics : [];
      }
    } catch (error) {
      if (this.config.enableConsoleLogging) {
        console.warn('Failed to load metrics from localStorage:', error);
      }
    }
  }

  // Отправка метрик в аналитику
  private async sendToAnalytics(metrics: PerformanceMetric[]) {
    if (!this.config.analyticsEndpoint) return;

    try {
      const response = await fetch(this.config.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metrics.map(metric => ({
            name: metric.name,
            value: metric.value,
            timestamp: metric.timestamp,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            sessionId: this.getSessionId(),
          })),
          sessionId: this.getSessionId(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      console.log('✅ Metrics sent to analytics');
    } catch (error) {
      console.error('❌ Failed to send metrics to analytics:', error);
    }
  }

  private getSessionId(): string {
    // Генерируем или получаем session ID для группировки метрик
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('performance-session-id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('performance-session-id', sessionId);
      }
      return sessionId;
    }
    return 'server-session';
  }

  // Публичные методы
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  getLatestMetrics(): Record<string, PerformanceMetric> {
    const latest: Record<string, PerformanceMetric> = {};
    
    for (const metric of this.metrics) {
      if (!latest[metric.name] || metric.timestamp > latest[metric.name].timestamp) {
        latest[metric.name] = metric;
      }
    }
    
    return latest;
  }

  clearMetrics() {
    this.metrics = [];
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('performance-metrics');
    }
  }

  updateConfig(newConfig: Partial<PerformanceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  // Метод для ручного добавления кастомных метрик
  addCustomMetric(name: string, value: number, additionalData?: Record<string, any>) {
    const metric: PerformanceMetric = {
      id: `custom-${Date.now()}-${Math.random()}`,
      name,
      value,
      rating: 'good',
      delta: 0,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      ...additionalData
    };

    this.addMetric(metric);
  }
}

// Создаем глобальный экземпляр
export const performanceMonitor = new PerformanceMonitor();

// Автоматическая инициализация в браузере
if (typeof window !== 'undefined') {
  // Сохраняем экземпляр в window для доступа из безопасной обертки
  (window as any).__performanceMonitor = performanceMonitor;
  
  // Инициализируем после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceMonitor.init();
    });
  } else {
    performanceMonitor.init();
  }
}

export default performanceMonitor;