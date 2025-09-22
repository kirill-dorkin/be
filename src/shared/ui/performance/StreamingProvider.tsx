'use client';

import React, { Suspense, startTransition } from 'react';

interface StreamingProviderProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ name?: string }>;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void; name?: string }>;
  priority?: 'high' | 'medium' | 'low';
  name?: string;
}

interface SuspenseBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ name?: string }>;
  name?: string;
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
}

interface StreamingMetrics {
  componentName: string;
  loadTime: number;
  priority: string;
  timestamp: number;
  success: boolean;
}

// Default streaming fallback
const DefaultStreamingFallback: React.FC<{ name?: string }> = ({ name }) => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg p-6">
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
      {name && (
        <div className="mt-4 text-xs text-gray-500">
          Loading {name}...
        </div>
      )}
    </div>
  </div>
);

// Default error boundary for streaming
const DefaultStreamingError: React.FC<{ error: Error; retry: () => void; name?: string }> = ({ 
  error, 
  retry, 
  name 
}) => (
  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
    <div className="flex items-center mb-4">
      <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-lg font-semibold text-red-800">
        {name ? `Failed to load ${name}` : 'Loading failed'}
      </h3>
    </div>
    <p className="text-red-700 mb-4 text-sm">{error.message}</p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
    >
      Retry
    </button>
  </div>
);

// Streaming error boundary
class StreamingErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ComponentType<{ error: Error; retry: () => void; name?: string }>;
    name?: string;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: StreamingErrorBoundary['props']) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Streaming Error:', error, errorInfo);
    
    // Report to performance monitoring
    if (typeof window !== 'undefined' && window.__performanceMonitor) {
      const monitor = window.__performanceMonitor as ExtendedPerformanceMonitor;
      if (monitor.reportStreamingError) {
        monitor.reportStreamingError({
          componentName: this.props.name || 'unknown',
          error: error.message,
          timestamp: Date.now()
        });
      }
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const ErrorComponent = this.props.fallback;
      return <ErrorComponent error={this.state.error} retry={this.retry} name={this.props.name} />;
    }

    return this.props.children;
  }
}

// Enhanced Suspense boundary with metrics
export const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({
  children,
  fallback: Fallback = DefaultStreamingFallback,
  name = 'component',
  priority = 'medium',
  timeout = 5000
}) => {
  const startTime = React.useRef<number>(Date.now());
  const [isTimedOut, setIsTimedOut] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
      console.warn(`Suspense boundary "${name}" timed out after ${timeout}ms`);
    }, timeout);

    return () => clearTimeout(timer);
  }, [name, timeout]);

  React.useEffect(() => {
    // Record successful load when component mounts
    const loadTime = Date.now() - startTime.current;
    
    if (typeof window !== 'undefined' && window.__performanceMonitor) {
      const monitor = window.__performanceMonitor as ExtendedPerformanceMonitor;
      if (monitor.reportStreamingMetrics) {
        monitor.reportStreamingMetrics({
          componentName: name,
          loadTime,
          priority,
          timestamp: Date.now(),
          success: !isTimedOut
        });
      }
    }
  }, [name, priority, isTimedOut]);

  const fallbackElement = React.useMemo(() => {
    if (isTimedOut) {
      return (
        <div className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-800">
              {name} is taking longer than expected to load...
            </span>
          </div>
        </div>
      );
    }
    
    return <Fallback name={name} />;
  }, [isTimedOut, name, Fallback]);

  return (
    <Suspense fallback={fallbackElement}>
      {children}
    </Suspense>
  );
};

// Main streaming provider
export const StreamingProvider: React.FC<StreamingProviderProps> = ({
  children,
  fallback = DefaultStreamingFallback,
  errorBoundary = DefaultStreamingError,
  priority = 'medium',
  name = 'stream'
}) => {
  return (
    <StreamingErrorBoundary fallback={errorBoundary} name={name}>
      <SuspenseBoundary fallback={fallback} name={name} priority={priority}>
        {children}
      </SuspenseBoundary>
    </StreamingErrorBoundary>
  );
};

// Hook for managing streaming state
export function useStreamingState<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [state, setState] = React.useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null
  });

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await asyncFn();
        
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          const err = error instanceof Error ? error : new Error('Unknown error');
          setState({ data: null, loading: false, error: err });
        }
      }
    };

    startTransition(() => {
      load();
    });

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}

// Hook for progressive enhancement
export function useProgressiveEnhancement() {
  const [isEnhanced, setIsEnhanced] = React.useState(false);

  React.useEffect(() => {
    // Check if we can enhance the experience
    const canEnhance = 
      typeof window !== 'undefined' &&
      'IntersectionObserver' in window &&
      'requestIdleCallback' in window &&
      navigator.connection?.effectiveType !== 'slow-2g';

    if (canEnhance) {
      // Use requestIdleCallback to enhance when browser is idle
      const enhance = () => {
        setIsEnhanced(true);
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(enhance);
      } else {
        setTimeout(enhance, 100);
      }
    }
  }, []);

  return isEnhanced;
}

// Hook for streaming metrics
export function useStreamingMetrics() {
  const [metrics, setMetrics] = React.useState<StreamingMetrics[]>([]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set up global performance monitor for streaming
    const existingMonitor = window.__performanceMonitor || {};
    
    const extendedMonitor: ExtendedPerformanceMonitor = {
      ...existingMonitor,
      reportStreamingMetrics: (metric: StreamingMetrics) => {
        setMetrics(prev => [...prev.slice(-99), metric]); // Keep last 100 metrics
      },
      reportStreamingError: (error: { componentName: string; error: string; timestamp: number }) => {
        console.error('Streaming error reported:', error);
      }
    };
    
    // Safely assign to window
    Object.assign(window, { __performanceMonitor: extendedMonitor });

    return () => {
      if (window.__performanceMonitor) {
        const monitor = window.__performanceMonitor as ExtendedPerformanceMonitor;
        delete monitor.reportStreamingMetrics;
        delete monitor.reportStreamingError;
      }
    };
  }, []);

  const getAverageLoadTime = React.useCallback(() => {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, metric) => sum + metric.loadTime, 0) / metrics.length;
  }, [metrics]);

  const getSuccessRate = React.useCallback(() => {
    if (metrics.length === 0) return 100;
    const successful = metrics.filter(m => m.success).length;
    return (successful / metrics.length) * 100;
  }, [metrics]);

  const getMetricsByPriority = React.useCallback(() => {
    return metrics.reduce((acc, metric) => {
      if (!acc[metric.priority]) {
        acc[metric.priority] = [];
      }
      acc[metric.priority].push(metric);
      return acc;
    }, {} as Record<string, StreamingMetrics[]>);
  }, [metrics]);

  const reportMetrics = React.useCallback((metrics: StreamingMetrics) => {
    if (typeof window !== 'undefined' && window.__performanceMonitor) {
      const monitor = window.__performanceMonitor as ExtendedPerformanceMonitor;
      if (monitor.reportStreamingMetrics) {
        monitor.reportStreamingMetrics(metrics);
      }
    }
  }, []);

  const reportError = React.useCallback((error: string, componentName: string) => {
    if (typeof window !== 'undefined' && window.__performanceMonitor) {
      const monitor = window.__performanceMonitor as ExtendedPerformanceMonitor;
      if (monitor.reportStreamingError) {
        monitor.reportStreamingError({
          componentName,
          error,
          timestamp: Date.now()
        });
      }
    }
  }, []);

  return {
    metrics,
    getAverageLoadTime,
    getSuccessRate,
    getMetricsByPriority,
    reportStreamingMetrics: reportMetrics,
    reportStreamingError: reportError
  };
}

// Extended performance monitor interface
interface ImagePerformanceMetrics {
  loadTime: number;
  size: number;
  format: string;
  cached: boolean;
}

interface ExtendedPerformanceMonitor {
  reportImageLoad?: (metrics: ImagePerformanceMetrics) => void;
  reportStreamingMetrics?: (metrics: StreamingMetrics) => void;
  reportStreamingError?: (error: { componentName: string; error: string; timestamp: number }) => void;
}

// Navigator.connection объявлен в SmartRouter.tsx

export default StreamingProvider;