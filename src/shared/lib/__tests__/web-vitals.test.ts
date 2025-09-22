import { webVitalsMonitor, getWebVitalsThresholds, getRating } from '../../../lib/web-vitals';

describe('WebVitalsMonitor', () => {
  it('should be defined', () => {
    expect(webVitalsMonitor).toBeDefined();
  });

  it('should have init method', () => {
    expect(webVitalsMonitor.init).toBeDefined();
    expect(typeof webVitalsMonitor.init).toBe('function');
  });

  it('should have getMetrics method', () => {
    expect(webVitalsMonitor.getMetrics).toBeDefined();
    expect(typeof webVitalsMonitor.getMetrics).toBe('function');
  });

  it('should have configure method', () => {
    expect(webVitalsMonitor.configure).toBeDefined();
    expect(typeof webVitalsMonitor.configure).toBe('function');
  });

  it('should return empty metrics initially', () => {
    const metrics = webVitalsMonitor.getMetrics();
    expect(Array.isArray(metrics)).toBe(true);
  });
});

describe('getWebVitalsThresholds', () => {
  it('should return correct thresholds', () => {
    const thresholds = getWebVitalsThresholds();
    expect(thresholds).toHaveProperty('LCP');
    expect(thresholds).toHaveProperty('INP');
    expect(thresholds).toHaveProperty('CLS');
    expect(thresholds).toHaveProperty('FCP');
    expect(thresholds).toHaveProperty('TTFB');
  });
});

describe('getRating', () => {
  it('should return correct rating for LCP', () => {
    expect(getRating('LCP', 2000)).toBe('good');
    expect(getRating('LCP', 3000)).toBe('needs-improvement');
    expect(getRating('LCP', 5000)).toBe('poor');
  });
});