import { performanceMonitor } from '../performance-monitor';

// Mock web-vitals
jest.mock('web-vitals', () => ({
  onCLS: jest.fn((callback) => {
    // Симулируем вызов callback с метрикой CLS
    setTimeout(() => callback({
      name: 'CLS',
      value: 0.05,
      rating: 'good',
      delta: 0.05,
      id: 'cls-test',
      entries: []
    }), 0);
  }),
  onFCP: jest.fn((callback) => {
    setTimeout(() => callback({
      name: 'FCP',
      value: 1500,
      rating: 'good',
      delta: 1500,
      id: 'fcp-test',
      entries: []
    }), 0);
  }),
  onLCP: jest.fn((callback) => {
    setTimeout(() => callback({
      name: 'LCP',
      value: 2000,
      rating: 'good',
      delta: 2000,
      id: 'lcp-test',
      entries: []
    }), 0);
  }),
  onTTFB: jest.fn((callback) => {
    setTimeout(() => callback({
      name: 'TTFB',
      value: 600,
      rating: 'good',
      delta: 600,
      id: 'ttfb-test',
      entries: []
    }), 0);
  }),
  onINP: jest.fn((callback) => {
    setTimeout(() => callback({
      name: 'INP',
      value: 180,
      rating: 'good',
      delta: 180,
      id: 'inp-test',
      entries: []
    }), 0);
  }),
}));

// Mock fetch для тестирования аналитики
global.fetch = jest.fn();

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  },
  writable: true,
});

// Mock PerformanceObserver
global.PerformanceObserver = jest.fn().mockImplementation((_callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => []),
})) as any;

// Add supportedEntryTypes to mock
(global.PerformanceObserver as any).supportedEntryTypes = ['navigation', 'resource', 'paint'];

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

describe('PerformanceMonitor', () => {
  let monitor: typeof performanceMonitor;
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    monitor = performanceMonitor;
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    // Сбрасываем состояние монитора
    monitor.clearMetrics();
    
    // Mock console methods
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    // Восстанавливаем console методы
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  afterEach(() => {
    // Очищаем состояние после каждого теста
    monitor.clearMetrics();
  });

  describe('Initialization', () => {
    it('should initialize monitor', () => {
      expect(monitor.isReady()).toBe(true); // Уже инициализирован автоматически
    });

    it('should have default config', () => {
      const config = monitor.getConfig();
      
      expect(config).toHaveProperty('enableAnalytics');
      expect(config).toHaveProperty('enableConsoleLogging');
      expect(config).toHaveProperty('enableLocalStorage');
      expect(config).toHaveProperty('analyticsEndpoint');
      expect(config).toHaveProperty('sampleRate');
      expect(config).toHaveProperty('thresholds');
    });
  });

  describe('Metric Collection', () => {
    it('should collect custom metrics', () => {
      const metricName = 'test-metric';
      const metricValue = 123.45;

      monitor.addCustomMetric(metricName, metricValue);
      
      const metrics = monitor.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      
      const testMetric = metrics.find(m => m.name === metricName);
      expect(testMetric).toBeDefined();
      expect(testMetric?.value).toBe(metricValue);
      expect(testMetric?.name).toBe(metricName);
    });

    it('should collect metrics with additional data', () => {
      const additionalData = { userId: '123', page: '/test' };

      monitor.addCustomMetric('test', 100, additionalData);
      
      const metrics = monitor.getMetrics();
      const testMetric = metrics.find(m => m.name === 'test');
      
      expect(testMetric).toBeDefined();
      expect(testMetric).toMatchObject(additionalData);
    });

    it('should get metrics by name', () => {
      monitor.addCustomMetric('metric1', 1);
      monitor.addCustomMetric('metric2', 2);
      monitor.addCustomMetric('metric1', 3);
      
      const metric1Results = monitor.getMetricsByName('metric1');
      expect(metric1Results).toHaveLength(2);
      expect(metric1Results.every(m => m.name === 'metric1')).toBe(true);
    });

    it('should get latest metrics', () => {
      monitor.addCustomMetric('test', 1);
      
      // Симулируем прошедшее время
      jest.advanceTimersByTime(1000);
      
      monitor.addCustomMetric('test', 2);
      monitor.addCustomMetric('other', 3);
      
      const latestMetrics = monitor.getLatestMetrics();
      expect(latestMetrics.test.value).toBe(2);
      expect(latestMetrics.other.value).toBe(3);
    });
  });

  describe('Analytics Integration', () => {
    beforeEach(() => {
      monitor.updateConfig({
        enableAnalytics: true,
        analyticsEndpoint: '/api/analytics/performance',
        enableConsoleLogging: false,
      });
    });

    it('should send metrics to analytics', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      monitor.addCustomMetric('test-metric', 100);
      
      // Ждем отправки метрики
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(fetch).toHaveBeenCalledWith('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('test-metric'),
      });
    });

    it('should handle analytics errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      monitor.addCustomMetric('test-metric', 100);
      
      // Ждем обработки ошибки
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send metrics to analytics'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should not send metrics when analytics disabled', async () => {
      monitor.updateConfig({ enableAnalytics: false });

      monitor.addCustomMetric('test-metric', 100);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Performance Thresholds', () => {
    it('should have default thresholds', () => {
      const config = monitor.getConfig();
      
      expect(config.thresholds).toHaveProperty('lcp');
      expect(config.thresholds).toHaveProperty('inp');
      expect(config.thresholds).toHaveProperty('cls');
      expect(config.thresholds).toHaveProperty('fcp');
      expect(config.thresholds).toHaveProperty('ttfb');
      expect(config.thresholds).toHaveProperty('inp');
      
      expect(config.thresholds.lcp.good).toBe(2500);
      expect(config.thresholds.lcp.poor).toBe(4000);
    });

    it('should collect web vitals metrics', () => {
      // Добавляем метрики с именами Web Vitals
      monitor.addCustomMetric('LCP', 2000);
      monitor.addCustomMetric('INP', 180);
      monitor.addCustomMetric('CLS', 0.05);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.find(m => m.name === 'LCP')?.value).toBe(2000);
      expect(metrics.find(m => m.name === 'INP')?.value).toBe(180);
      expect(metrics.find(m => m.name === 'CLS')?.value).toBe(0.05);
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const originalConfig = monitor.getConfig();
      
      const newConfig = {
        enableConsoleLogging: !originalConfig.enableConsoleLogging,
        sampleRate: 0.5,
      };

      monitor.updateConfig(newConfig);
      
      const updatedConfig = monitor.getConfig();
      expect(updatedConfig.enableConsoleLogging).toBe(newConfig.enableConsoleLogging);
      expect(updatedConfig.sampleRate).toBe(newConfig.sampleRate);
    });

    it('should merge configuration with existing', () => {
      const originalConfig = monitor.getConfig();
      
      monitor.updateConfig({ sampleRate: 0.8 });
      
      const updatedConfig = monitor.getConfig();
      expect(updatedConfig.sampleRate).toBe(0.8);
      expect(updatedConfig.enableAnalytics).toBe(originalConfig.enableAnalytics);
    });
  });

  describe('Cleanup', () => {
    it('should clear metrics', () => {
      monitor.addCustomMetric('test1', 1);
      monitor.addCustomMetric('test2', 2);
      
      expect(monitor.getMetrics()).toHaveLength(2);
      
      monitor.clearMetrics();
      
      expect(monitor.getMetrics()).toHaveLength(0);
    });
  });

  describe('Metric Properties', () => {
    it('should generate proper metric structure', () => {
      monitor.addCustomMetric('test-metric', 100);
      
      const metrics = monitor.getMetrics();
      const metric = metrics[0];
      
      expect(metric).toHaveProperty('id');
      expect(metric).toHaveProperty('name', 'test-metric');
      expect(metric).toHaveProperty('value', 100);
      expect(metric).toHaveProperty('rating');
      expect(metric).toHaveProperty('delta');
      expect(metric).toHaveProperty('timestamp');
      expect(metric).toHaveProperty('url');
      expect(metric).toHaveProperty('userAgent');
      
      expect(typeof metric.id).toBe('string');
      expect(typeof metric.timestamp).toBe('number');
      expect(['good', 'needs-improvement', 'poor']).toContain(metric.rating);
    });
  });
});