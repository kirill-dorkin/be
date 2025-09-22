// Безопасная обертка для performance-monitor, которая работает на сервере
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

// Заглушка для сервера
const serverStub = {
  init: () => {},
  getMetrics: () => [],
  getMetricsByName: () => [],
  getLatestMetrics: () => ({}),
  clearMetrics: () => {},
  updateConfig: () => {},
  isReady: () => false,
  getConfig: () => ({
    enableAnalytics: false,
    enableConsoleLogging: false,
    enableLocalStorage: false,
    sampleRate: 1.0,
    thresholds: {
      lcp: { good: 2500, poor: 4000 },
      inp: { good: 200, poor: 500 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    }
  }),
  addCustomMetric: () => {}
};

// Динамический импорт только на клиенте
let performanceMonitorInstance: any = null;

export const getPerformanceMonitor = async () => {
  if (typeof window === 'undefined') {
    return serverStub;
  }

  if (!performanceMonitorInstance) {
    try {
      const module = await import('@/lib/performance-monitor');
      performanceMonitorInstance = module.performanceMonitor;
    } catch (error) {
      console.warn('Failed to load performance monitor:', error);
      return serverStub;
    }
  }

  return performanceMonitorInstance;
};

// Синхронная версия для случаев, когда нужен немедленный доступ
export const performanceMonitor = typeof window !== 'undefined' ? 
  (() => {
    try {
      // Пытаемся получить уже загруженный экземпляр
      return (window as any).__performanceMonitor || serverStub;
    } catch {
      return serverStub;
    }
  })() : 
  serverStub;

export default performanceMonitor;