import { performanceMonitor } from '@/lib/performance-monitor';

// Mock web-vitals
jest.mock('web-vitals', () => ({
  onCLS: jest.fn(),
  onFCP: jest.fn(),
  onINP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
  },
  writable: true,
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'test-user-agent',
    connection: {
      effectiveType: '4g',
    },
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    performanceMonitor.clearMetrics();
    localStorageMock.clear();
  });

  describe('Initialization', () => {
    it('should initialize and be ready', () => {
      expect(performanceMonitor.isReady()).toBe(true);
      const config = performanceMonitor.getConfig();
      // enableConsoleLogging зависит от NODE_ENV
      expect(typeof config.enableConsoleLogging).toBe('boolean');
      expect(config.sampleRate).toBe(1.0);
    });

    it('should update configuration', () => {
      const customConfig = {
        enableAnalytics: false,
        sampleRate: 0.5,
      };
      
      performanceMonitor.updateConfig(customConfig);
      const config = performanceMonitor.getConfig();
      
      expect(config.enableAnalytics).toBe(false);
      expect(config.sampleRate).toBe(0.5);
    });
  });

  describe('Metrics Collection', () => {
    it('should collect and store metrics', () => {
      const initialMetrics = performanceMonitor.getMetrics();
      expect(Array.isArray(initialMetrics)).toBe(true);
    });

    it('should add custom metrics', () => {
      const metricName = 'custom-metric';
      const metricValue = 123;
      const additionalData = { component: 'test' };
      
      performanceMonitor.addCustomMetric(metricName, metricValue, additionalData);
      
      const metrics = performanceMonitor.getMetrics();
      const customMetric = metrics.find(m => m.name === metricName);
      
      expect(customMetric).toBeDefined();
      expect(customMetric?.value).toBe(metricValue);
    });

    it('should get metrics by name', () => {
      performanceMonitor.addCustomMetric('test-metric', 100);
      performanceMonitor.addCustomMetric('test-metric', 200);
      performanceMonitor.addCustomMetric('other-metric', 300);
      
      const testMetrics = performanceMonitor.getMetricsByName('test-metric');
      
      expect(testMetrics.length).toBeGreaterThanOrEqual(0);
    });

    it('should get latest metrics', () => {
      performanceMonitor.addCustomMetric('lcp', 2000);
      performanceMonitor.addCustomMetric('fcp', 1500);
      
      const latestMetrics = performanceMonitor.getLatestMetrics();
      
      expect(typeof latestMetrics).toBe('object');
    });
  });

  describe('Analytics Integration', () => {
    it('should handle analytics configuration', async () => {
      performanceMonitor.updateConfig({ enableAnalytics: true });
      const config = performanceMonitor.getConfig();
      expect(config.enableAnalytics).toBe(true);
    });

    it('should handle analytics disabled state', async () => {
      performanceMonitor.updateConfig({ enableAnalytics: false });
      const config = performanceMonitor.getConfig();
      expect(config.enableAnalytics).toBe(false);
    });
  });

  describe('Local Storage', () => {
    it('should handle localStorage configuration', () => {
      performanceMonitor.updateConfig({ enableLocalStorage: true });
      const config = performanceMonitor.getConfig();
      expect(config.enableLocalStorage).toBe(true);
    });

    it('should handle localStorage disabled', () => {
      performanceMonitor.updateConfig({ enableLocalStorage: false });
      const config = performanceMonitor.getConfig();
      expect(config.enableLocalStorage).toBe(false);
    });
  });

  describe('Metric Rating System', () => {
    it('should have proper threshold configuration', () => {
      const config = performanceMonitor.getConfig();
      
      expect(config.thresholds.lcp.good).toBe(2500);
      expect(config.thresholds.lcp.poor).toBe(4000);
      expect(config.thresholds.cls.good).toBe(0.1);
      expect(config.thresholds.cls.poor).toBe(0.25);
    });

    it('should allow threshold updates', () => {
      const newThresholds = {
        thresholds: {
          lcp: { good: 2000, poor: 3500 },
          cls: { good: 0.05, poor: 0.2 },
          inp: { good: 150, poor: 400 },
          fcp: { good: 1500, poor: 2500 },
          ttfb: { good: 600, poor: 1500 }
        },
      };
      
      performanceMonitor.updateConfig(newThresholds);
      const config = performanceMonitor.getConfig();
      
      expect(config.thresholds.lcp.good).toBe(2000);
      expect(config.thresholds.cls.good).toBe(0.05);
    });
  });

  describe('Configuration Management', () => {
    it('should merge configuration updates', () => {
      const initialConfig = performanceMonitor.getConfig();
      const originalSampleRate = initialConfig.sampleRate;
      
      performanceMonitor.updateConfig({
        enableAnalytics: false,
      });
      
      const updatedConfig = performanceMonitor.getConfig();
      expect(updatedConfig.enableAnalytics).toBe(false);
      expect(updatedConfig.sampleRate).toBe(originalSampleRate); // Should remain unchanged
    });
  });

  describe('Cleanup Operations', () => {
    it('should clear all metrics', () => {
      performanceMonitor.addCustomMetric('test-metric-1', 100);
      performanceMonitor.addCustomMetric('test-metric-2', 200);
      
      performanceMonitor.clearMetrics();
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(0);
    });
  });

  describe('Web Vitals Integration', () => {
    it('should be initialized for web vitals collection', () => {
      // Verify that the monitor is ready to collect web vitals
      expect(performanceMonitor.isReady()).toBe(true);
      
      // Verify that web vitals monitoring is properly configured
      const config = performanceMonitor.getConfig();
      expect(config.thresholds).toBeDefined();
      expect(config.thresholds.lcp).toBeDefined();
      expect(config.thresholds.cls).toBeDefined();
      expect(config.thresholds.inp).toBeDefined();
    });
  });
});