'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface WebVitalsMetrics {
  lcp: number | null; // Largest Contentful Paint
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  inp: number | null; // Interaction to Next Paint
  ttfb: number | null; // Time to First Byte
  timestamp: Date;
}

interface PerformanceMetrics {
  webVitals: WebVitalsMetrics;
  navigation: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  resources: {
    totalRequests: number;
    totalSize: number;
    slowestResource: { name: string; duration: number } | null;
    failedRequests: number;
  };
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null;
}

interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
}

class PerformanceTracker {
  private metrics: PerformanceMetrics | null = null;
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();
  private alertObservers: Set<(alert: PerformanceAlert) => void> = new Set();
  private performanceObserver: PerformanceObserver | null = null;
  private webVitalsObserver: PerformanceObserver | null = null;
  private memoryInterval: ReturnType<typeof setInterval> | null = null;

  // Thresholds for performance alerts
  private thresholds = {
    lcp: 2500, // Good: ≤2.5s
    cls: 0.1,  // Good: ≤0.1
    fcp: 1800, // Good: ≤1.8s
    inp: 200,  // Good: ≤200ms
    ttfb: 800, // Good: ≤800ms
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeTracking();
    }
  }

  private initializeTracking(): void {
    this.setupWebVitalsTracking();
    this.setupNavigationTracking();
    this.setupResourceTracking();
    this.setupMemoryTracking();
    this.initializeMetrics();
  }

  private setupWebVitalsTracking(): void {
    if ('PerformanceObserver' in window) {
      // Track LCP
      this.webVitalsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            this.updateWebVital('lcp', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            this.updateWebVital('inp', (entry as PerformanceEventTiming).processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift' && !(entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) {
            this.updateWebVital('cls', (entry as PerformanceEntry & { value: number }).value);
          }
        });
      });

      try {
        this.webVitalsObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (error) {
        console.warn('Some performance entry types not supported:', error);
      }

      // Track paint metrics
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.updateWebVital('fcp', entry.startTime);
          }
        });
      });

      try {
        paintObserver.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('Paint timing not supported:', error);
      }
    }

    // Track TTFB from navigation timing
    if ('performance' in window && 'timing' in performance) {
      const navigationTiming = performance.timing;
      const ttfb = navigationTiming.responseStart - navigationTiming.navigationStart;
      this.updateWebVital('ttfb', ttfb);
    }
  }

  private setupNavigationTracking(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.updateNavigationMetrics(entry as PerformanceNavigationTiming);
          }
        });
      });

      try {
        this.performanceObserver.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('Navigation timing not supported:', error);
      }
    }
  }

  private setupResourceTracking(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.updateResourceMetrics(entry as PerformanceResourceTiming);
          }
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource timing not supported:', error);
      }
    }
  }

  private setupMemoryTracking(): void {
    if ('memory' in performance) {
      this.memoryInterval = setInterval(() => {
        this.updateMemoryMetrics();
      }, 5000); // Update every 5 seconds
    }
  }

  private initializeMetrics(): void {
    const connection = this.getConnectionInfo();
    
    this.metrics = {
      webVitals: {
        lcp: null,
        cls: null,
        fcp: null,
        inp: null,
        ttfb: null,
        timestamp: new Date(),
      },
      navigation: {
        domContentLoaded: 0,
        loadComplete: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
      },
      resources: {
        totalRequests: 0,
        totalSize: 0,
        slowestResource: null,
        failedRequests: 0,
      },
      memory: null,
      connection,
    };

    this.updateMemoryMetrics();
    this.notifyObservers();
  }

  private updateWebVital(metric: string, value: number): void {
    if (!this.metrics) return;

    const webVitals = this.metrics.webVitals;

    if (metric === 'cls') {
      // Accumulate CLS values
      webVitals.cls = (webVitals.cls || 0) + value;
    } else if (metric === 'lcp') {
      webVitals.lcp = value;
    } else if (metric === 'fcp') {
      webVitals.fcp = value;
    } else if (metric === 'ttfb') {
      webVitals.ttfb = value;
    } else if (metric === 'inp') {
      webVitals.inp = value;
    }

    this.metrics.webVitals.timestamp = new Date();

    // Check thresholds and emit alerts
    this.checkThreshold(metric, value);
    this.notifyObservers();
  }

  private updateNavigationMetrics(entry: PerformanceNavigationTiming): void {
    if (!this.metrics) return;

    this.metrics.navigation = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      firstPaint: 0, // Will be updated by paint observer
      firstContentfulPaint: 0, // Will be updated by paint observer
    };

    this.notifyObservers();
  }

  private updateResourceMetrics(entry: PerformanceResourceTiming): void {
    if (!this.metrics) return;

    this.metrics.resources.totalRequests++;
    this.metrics.resources.totalSize += entry.transferSize || 0;

    // Track slowest resource
    if (!this.metrics.resources.slowestResource || 
        entry.duration > this.metrics.resources.slowestResource.duration) {
      this.metrics.resources.slowestResource = {
        name: entry.name,
        duration: entry.duration,
      };
    }

    // Track failed requests
    if (entry.transferSize === 0 && entry.duration > 0) {
      this.metrics.resources.failedRequests++;
    }

    this.notifyObservers();
  }

  private updateMemoryMetrics(): void {
    if (!this.metrics || !('memory' in performance)) return;

    const memory = (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    
    this.metrics.memory = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };

    // Check memory usage threshold (80% of limit)
    const memoryUsagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    if (memoryUsagePercent > 80) {
      this.emitAlert({
        type: 'warning',
        metric: 'memory',
        value: memoryUsagePercent,
        threshold: 80,
        message: `High memory usage: ${memoryUsagePercent.toFixed(1)}%`,
        timestamp: new Date(),
      });
    }

    this.notifyObservers();
  }

  private getConnectionInfo() {
    const nav = navigator as Navigator & { connection?: { effectiveType: string; downlink: number; rtt: number } };
    if (nav.connection) {
      return {
        effectiveType: nav.connection.effectiveType,
        downlink: nav.connection.downlink,
        rtt: nav.connection.rtt,
      };
    }
    return null;
  }

  private checkThreshold(metric: string, value: number): void {
    const threshold = this.thresholds[metric as keyof typeof this.thresholds];
    if (!threshold) return;

    let isExceeded = false;
    let type: 'warning' | 'error' = 'warning';

    if (metric === 'cls') {
      isExceeded = value > threshold;
      type = value > threshold * 2 ? 'error' : 'warning';
    } else {
      isExceeded = value > threshold;
      type = value > threshold * 1.5 ? 'error' : 'warning';
    }

    if (isExceeded) {
      this.emitAlert({
        type,
        metric,
        value,
        threshold,
        message: `${metric.toUpperCase()} exceeded threshold: ${value.toFixed(1)}${metric === 'cls' ? '' : 'ms'} > ${threshold}${metric === 'cls' ? '' : 'ms'}`,
        timestamp: new Date(),
      });
    }
  }

  private emitAlert(alert: PerformanceAlert): void {
    this.alertObservers.forEach(observer => observer(alert));
  }

  getMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  subscribe(observer: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  subscribeToAlerts(observer: (alert: PerformanceAlert) => void): () => void {
    this.alertObservers.add(observer);
    return () => this.alertObservers.delete(observer);
  }

  private notifyObservers(): void {
    if (this.metrics) {
      this.observers.forEach(observer => observer(this.metrics!));
    }
  }

  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    if (this.webVitalsObserver) {
      this.webVitalsObserver.disconnect();
    }
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
    this.observers.clear();
    this.alertObservers.clear();
  }
}

// Global performance tracker instance
const globalPerformanceTracker = new PerformanceTracker();

interface PerformanceDisplayProps {
  className?: string;
  showAlerts?: boolean;
  compact?: boolean;
}

export const PerformanceDisplay: React.FC<PerformanceDisplayProps> = ({
  className = '',
  showAlerts = true,
  compact = false,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  useEffect(() => {
    const unsubscribeMetrics = globalPerformanceTracker.subscribe(setMetrics);
    const unsubscribeAlerts = globalPerformanceTracker.subscribeToAlerts((alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5 alerts
    });

    setMetrics(globalPerformanceTracker.getMetrics());

    return () => {
      unsubscribeMetrics();
      unsubscribeAlerts();
    };
  }, []);

  const getScoreColor = useCallback((metric: string, value: number | null) => {
    if (value === null) return 'text-gray-400';
    
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      inp: { good: 200, poor: 500 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-400';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const formatValue = useCallback((metric: string, value: number | null) => {
    if (value === null) return 'N/A';
    
    if (metric === 'cls') {
      return value.toFixed(3);
    }
    
    if (value < 1000) {
      return `${Math.round(value)}ms`;
    }
    
    return `${(value / 1000).toFixed(2)}s`;
  }, []);

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  if (!metrics) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Performance</h3>
          <div className="flex space-x-4 text-xs">
            <span className={`font-medium ${getScoreColor('lcp', metrics.webVitals.lcp)}`}>
              LCP: {formatValue('lcp', metrics.webVitals.lcp)}
            </span>
            <span className={`font-medium ${getScoreColor('inp', metrics.webVitals.inp)}`}>
              INP: {formatValue('inp', metrics.webVitals.inp)}
            </span>
            <span className={`font-medium ${getScoreColor('cls', metrics.webVitals.cls)}`}>
              CLS: {formatValue('cls', metrics.webVitals.cls)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Performance Monitor</h3>
      
      {/* Web Vitals */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Core Web Vitals</h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {Object.entries(metrics.webVitals).filter(([key]) => key !== 'timestamp').map(([key, value]) => (
            <div key={key} className="text-center">
              <div className={`text-xl font-bold ${getScoreColor(key, value)}`}>
                {formatValue(key, value)}
              </div>
              <div className="text-xs text-gray-600 uppercase">{key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Resources</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Requests:</span>
              <span className="font-medium">{metrics.resources.totalRequests}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Size:</span>
              <span className="font-medium">{formatBytes(metrics.resources.totalSize)}</span>
            </div>
            <div className="flex justify-between">
              <span>Failed Requests:</span>
              <span className={`font-medium ${metrics.resources.failedRequests > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.resources.failedRequests}
              </span>
            </div>
            {metrics.resources.slowestResource && (
              <div className="text-xs text-gray-500 mt-2">
                Slowest: {metrics.resources.slowestResource.name.split('/').pop()} 
                ({metrics.resources.slowestResource.duration.toFixed(0)}ms)
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Memory & Connection</h4>
          <div className="space-y-2 text-sm">
            {metrics.memory && (
              <>
                <div className="flex justify-between">
                  <span>JS Heap Used:</span>
                  <span className="font-medium">{formatBytes(metrics.memory.usedJSHeapSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span>JS Heap Total:</span>
                  <span className="font-medium">{formatBytes(metrics.memory.totalJSHeapSize)}</span>
                </div>
              </>
            )}
            {metrics.connection && (
              <>
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <span className="font-medium">{metrics.connection.effectiveType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Downlink:</span>
                  <span className="font-medium">{metrics.connection.downlink} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span>RTT:</span>
                  <span className="font-medium">{metrics.connection.rtt}ms</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Alerts</h4>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg text-sm ${
                alert.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                alert.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <div className="flex justify-between items-start">
                  <span>{alert.message}</span>
                  <span className="text-xs opacity-75">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  useEffect(() => {
    const unsubscribeMetrics = globalPerformanceTracker.subscribe(setMetrics);
    const unsubscribeAlerts = globalPerformanceTracker.subscribeToAlerts((alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    });

    setMetrics(globalPerformanceTracker.getMetrics());

    return () => {
      unsubscribeMetrics();
      unsubscribeAlerts();
    };
  }, []);

  return {
    metrics,
    alerts,
    tracker: globalPerformanceTracker,
  };
};

export const useWebVitals = () => {
  const [webVitals, setWebVitals] = useState<WebVitalsMetrics | null>(null);

  useEffect(() => {
    const unsubscribe = globalPerformanceTracker.subscribe((metrics) => {
      setWebVitals(metrics.webVitals);
    });

    const currentMetrics = globalPerformanceTracker.getMetrics();
    if (currentMetrics) {
      setWebVitals(currentMetrics.webVitals);
    }

    return unsubscribe;
  }, []);

  return webVitals;
};

export default {
  PerformanceDisplay,
  usePerformanceMetrics,
  useWebVitals,
  PerformanceTracker,
};