'use client';

import React, { Suspense, useEffect, useState, ReactNode } from 'react';

interface StreamingMetrics {
  ttfb: number;
  fcp: number;
  lcp: number;
  streamingChunks: number;
  suspenseBoundaries: number;
  hydrationTime: number;
  renderingTime: number;
}

interface SuspenseBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  name?: string;
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
  onError?: (error: Error) => void;
  onResolve?: () => void;
}

// Streaming performance monitor
class StreamingPerformanceMonitor {
  private static instance: StreamingPerformanceMonitor;
  private metrics: StreamingMetrics;
  private observers: Set<(metrics: StreamingMetrics) => void> = new Set();
  private suspenseBoundaries = new Map<string, { startTime: number; resolved: boolean }>();
  private streamingStartTime: number = 0;

  constructor() {
    this.metrics = {
      ttfb: 0,
      fcp: 0,
      lcp: 0,
      streamingChunks: 0,
      suspenseBoundaries: 0,
      hydrationTime: 0,
      renderingTime: 0
    };

    this.setupPerformanceObserver();
    this.trackHydration();
  }

  static getInstance(): StreamingPerformanceMonitor {
    if (!StreamingPerformanceMonitor.instance) {
      StreamingPerformanceMonitor.instance = new StreamingPerformanceMonitor();
    }
    return StreamingPerformanceMonitor.instance;
  }

  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      // Track Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'navigation':
              const navEntry = entry as PerformanceNavigationTiming;
              this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
              break;
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                this.metrics.fcp = entry.startTime;
              }
              break;
            case 'largest-contentful-paint':
              this.metrics.lcp = entry.startTime;
              break;
          }
        }
        this.notifyObservers();
      });

      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    } catch (error) {
      console.warn('Failed to setup performance observer:', error);
    }
  }

  private trackHydration(): void {
    if (typeof window === 'undefined') return;

    const hydrationStart = performance.now();
    
    // Track when React hydration completes
    const checkHydration = () => {
      if (document.readyState === 'complete') {
        this.metrics.hydrationTime = performance.now() - hydrationStart;
        this.notifyObservers();
      } else {
        requestAnimationFrame(checkHydration);
      }
    };

    requestAnimationFrame(checkHydration);
  }

  startSuspenseBoundary(name: string): void {
    this.suspenseBoundaries.set(name, {
      startTime: performance.now(),
      resolved: false
    });
    this.metrics.suspenseBoundaries++;
    this.notifyObservers();
  }

  resolveSuspenseBoundary(name: string): void {
    const boundary = this.suspenseBoundaries.get(name);
    if (boundary && !boundary.resolved) {
      boundary.resolved = true;
      const resolveTime = performance.now() - boundary.startTime;
      
      // Track rendering time
      this.metrics.renderingTime = Math.max(this.metrics.renderingTime, resolveTime);
      this.notifyObservers();
    }
  }

  trackStreamingChunk(): void {
    this.metrics.streamingChunks++;
    this.notifyObservers();
  }

  subscribe(observer: (metrics: StreamingMetrics) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer({ ...this.metrics }));
  }

  getMetrics(): StreamingMetrics {
    return { ...this.metrics };
  }

  // Analyze streaming performance
  analyzeStreamingPerformance(): {
    ttfbGrade: 'good' | 'needs-improvement' | 'poor';
    fcpGrade: 'good' | 'needs-improvement' | 'poor';
    lcpGrade: 'good' | 'needs-improvement' | 'poor';
    streamingEfficiency: number;
    recommendations: string[];
  } {
    const ttfbGrade = this.metrics.ttfb <= 800 ? 'good' : 
                     this.metrics.ttfb <= 1800 ? 'needs-improvement' : 'poor';
    
    const fcpGrade = this.metrics.fcp <= 1800 ? 'good' : 
                     this.metrics.fcp <= 3000 ? 'needs-improvement' : 'poor';
    
    const lcpGrade = this.metrics.lcp <= 2500 ? 'good' : 
                     this.metrics.lcp <= 4000 ? 'needs-improvement' : 'poor';

    const streamingEfficiency = this.metrics.suspenseBoundaries > 0 
      ? (this.metrics.streamingChunks / this.metrics.suspenseBoundaries) * 100 
      : 0;

    const recommendations: string[] = [];
    
    if (ttfbGrade === 'poor') {
      recommendations.push('Optimize server response time and enable streaming SSR');
    }
    
    if (fcpGrade === 'poor') {
      recommendations.push('Reduce initial bundle size and implement progressive hydration');
    }
    
    if (lcpGrade === 'poor') {
      recommendations.push('Optimize largest contentful paint with better resource prioritization');
    }
    
    if (streamingEfficiency < 50) {
      recommendations.push('Increase streaming chunk granularity for better performance');
    }

    return {
      ttfbGrade,
      fcpGrade,
      lcpGrade,
      streamingEfficiency,
      recommendations
    };
  }
}

// Enhanced Suspense boundary with performance tracking
export const SmartSuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({
  fallback,
  children,
  name = `boundary-${Math.random().toString(36).substr(2, 9)}`,
  timeout = 5000,
  onError,
  onResolve
}) => {
  const [hasError, setHasError] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const monitor = StreamingPerformanceMonitor.getInstance();

  useEffect(() => {
    monitor.startSuspenseBoundary(name);
    
    const timer = setTimeout(() => {
      if (!isResolved) {
        const error = new Error(`Suspense boundary "${name}" timed out after ${timeout}ms`);
        setHasError(true);
        onError?.(error);
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [name, timeout, isResolved, onError, monitor]);

  useEffect(() => {
    if (!hasError && !isResolved) {
      const checkResolution = () => {
        // Simple heuristic: if children are rendered without suspense, consider resolved
        setIsResolved(true);
        monitor.resolveSuspenseBoundary(name);
        onResolve?.();
      };

      // Use a small delay to allow React to settle
      const timer = setTimeout(checkResolution, 100);
      return () => clearTimeout(timer);
    }
  }, [hasError, isResolved, name, onResolve, monitor]);

  if (hasError) {
    return (
      <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-700">Failed to load content</p>
        <button 
          onClick={() => {
            setHasError(false);
            setIsResolved(false);
          }}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Progressive hydration component
export const ProgressiveHydration: React.FC<{
  children: ReactNode;
  when?: () => boolean;
  onIdle?: boolean;
  onVisible?: boolean;
  priority?: 'high' | 'medium' | 'low';
}> = ({ 
  children, 
  when, 
  onIdle = false, 
  onVisible = false,
  priority = 'medium'
}) => {
  const [shouldHydrate, setShouldHydrate] = useState(() => {
    if (typeof window === 'undefined') return true; // SSR
    if (when) return when();
    if (!onIdle && !onVisible) return true;
    return false;
  });

  useEffect(() => {
    if (shouldHydrate) return;

    let cleanup: (() => void) | undefined;

    if (onIdle) {
      const scheduleHydration = () => {
        if (window.requestIdleCallback) {
          const id = window.requestIdleCallback(() => setShouldHydrate(true), {
            timeout: priority === 'high' ? 1000 : priority === 'medium' ? 3000 : 5000
          });
          cleanup = () => window.cancelIdleCallback(id);
        } else {
          const id = setTimeout(() => setShouldHydrate(true), 100);
          cleanup = () => clearTimeout(id);
        }
      };

      scheduleHydration();
    }

    if (onVisible) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setShouldHydrate(true);
          }
        },
        { threshold: 0.1 }
      );

      // Create a placeholder element to observe
      const placeholder = document.createElement('div');
      document.body.appendChild(placeholder);
      observer.observe(placeholder);

      cleanup = () => {
        observer.disconnect();
        document.body.removeChild(placeholder);
      };
    }

    return cleanup;
  }, [shouldHydrate, onIdle, onVisible, priority]);

  if (!shouldHydrate) {
    return <div className="progressive-hydration-placeholder" />;
  }

  return <>{children}</>;
};

// Streaming chunk component
export const StreamingChunk: React.FC<{
  children: ReactNode;
  priority?: 'high' | 'medium' | 'low';
  chunkId?: string;
}> = ({ children, priority = 'medium', chunkId }) => {
  const monitor = StreamingPerformanceMonitor.getInstance();

  useEffect(() => {
    monitor.trackStreamingChunk();
  }, [monitor]);

  return (
    <div 
      className={`streaming-chunk priority-${priority}`}
      data-chunk-id={chunkId}
    >
      {children}
    </div>
  );
};

// Streaming metrics display
export const StreamingMetrics: React.FC<{
  showDetails?: boolean;
}> = ({ showDetails = false }) => {
  const [metrics, setMetrics] = useState<StreamingMetrics>(() => 
    StreamingPerformanceMonitor.getInstance().getMetrics()
  );
  const [analysis, setAnalysis] = useState(() => 
    StreamingPerformanceMonitor.getInstance().analyzeStreamingPerformance()
  );

  useEffect(() => {
    const monitor = StreamingPerformanceMonitor.getInstance();
    
    const unsubscribe = monitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setAnalysis(monitor.analyzeStreamingPerformance());
    });

    return unsubscribe;
  }, []);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="streaming-metrics p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Streaming Performance</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="metric">
          <div className="text-sm text-gray-600">TTFB</div>
          <div className={`text-lg font-bold ${getGradeColor(analysis.ttfbGrade)}`}>
            {metrics.ttfb.toFixed(0)}ms
          </div>
          <div className="text-xs text-gray-500">{analysis.ttfbGrade}</div>
        </div>
        
        <div className="metric">
          <div className="text-sm text-gray-600">FCP</div>
          <div className={`text-lg font-bold ${getGradeColor(analysis.fcpGrade)}`}>
            {metrics.fcp.toFixed(0)}ms
          </div>
          <div className="text-xs text-gray-500">{analysis.fcpGrade}</div>
        </div>
        
        <div className="metric">
          <div className="text-sm text-gray-600">LCP</div>
          <div className={`text-lg font-bold ${getGradeColor(analysis.lcpGrade)}`}>
            {metrics.lcp.toFixed(0)}ms
          </div>
          <div className="text-xs text-gray-500">{analysis.lcpGrade}</div>
        </div>
      </div>

      {showDetails && (
        <div className="details grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="metric">
            <div className="text-sm text-gray-600">Streaming Chunks</div>
            <div className="text-lg font-bold">{metrics.streamingChunks}</div>
          </div>
          <div className="metric">
            <div className="text-sm text-gray-600">Suspense Boundaries</div>
            <div className="text-lg font-bold">{metrics.suspenseBoundaries}</div>
          </div>
          <div className="metric">
            <div className="text-sm text-gray-600">Hydration Time</div>
            <div className="text-lg font-bold">{metrics.hydrationTime.toFixed(0)}ms</div>
          </div>
          <div className="metric">
            <div className="text-sm text-gray-600">Rendering Time</div>
            <div className="text-lg font-bold">{metrics.renderingTime.toFixed(0)}ms</div>
          </div>
        </div>
      )}

      {analysis.recommendations.length > 0 && (
        <div className="recommendations">
          <h4 className="font-semibold mb-2">Recommendations</h4>
          <ul className="list-disc list-inside space-y-1">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-700">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Hook for streaming metrics
export function useStreamingMetrics() {
  const [metrics, setMetrics] = useState<StreamingMetrics>(() => 
    StreamingPerformanceMonitor.getInstance().getMetrics()
  );

  useEffect(() => {
    const monitor = StreamingPerformanceMonitor.getInstance();
    const unsubscribe = monitor.subscribe(setMetrics);
    return unsubscribe;
  }, []);

  return metrics;
}

// Hook for progressive hydration
export function useProgressiveHydration(
  condition: () => boolean,
  options: { timeout?: number; priority?: 'high' | 'medium' | 'low' } = {}
) {
  const [shouldHydrate, setShouldHydrate] = useState(false);
  const { timeout = 5000, priority = 'medium' } = options;

  useEffect(() => {
    if (condition()) {
      setShouldHydrate(true);
      return;
    }

    const checkCondition = () => {
      if (condition()) {
        setShouldHydrate(true);
      } else {
        const delay = priority === 'high' ? 100 : priority === 'medium' ? 500 : 1000;
        setTimeout(checkCondition, delay);
      }
    };

    const timer = setTimeout(() => {
      setShouldHydrate(true); // Fallback
    }, timeout);

    checkCondition();

    return () => clearTimeout(timer);
  }, [condition, timeout, priority]);

  return shouldHydrate;
}

// RequestIdleCallback fallback for browsers that don't support it
// requestIdleCallback и cancelIdleCallback уже определены в современных браузерах

export default StreamingPerformanceMonitor;