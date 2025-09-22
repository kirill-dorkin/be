'use client';

import React, { Suspense, useEffect, useState, useCallback, useMemo, Component, ReactNode } from 'react';

interface SuspenseMetrics {
  suspenseCount: number;
  fallbackShown: number;
  averageLoadTime: number;
  errorRate: number;
  chunkLoadTimes: Map<string, number>;
  streamingMetrics: {
    ttfb: number;
    firstChunk: number;
    lastChunk: number;
    totalChunks: number;
  };
}

interface SuspenseConfig {
  timeout: number;
  retryCount: number;
  enableStreaming: boolean;
  chunkSize: number;
  priority: 'high' | 'medium' | 'low';
  preloadStrategy: 'eager' | 'lazy' | 'viewport';
}

interface OptimizedSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
  config?: Partial<SuspenseConfig>;
  onLoadStart?: () => void;
  onLoadEnd?: (duration: number) => void;
  onError?: (error: Error) => void;
  identifier?: string;
}

interface ProgressiveLoaderProps {
  children: ReactNode;
  stages: ReactNode[];
  config?: Partial<SuspenseConfig>;
}

interface StreamingSSRProps {
  children: ReactNode;
  chunkBoundaries?: string[];
  onChunkLoad?: (chunkId: string, duration: number) => void;
}

// Custom Error Boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary p-4 border border-red-300 rounded bg-red-50">
          <h3 className="text-red-800 font-semibold">Something went wrong</h3>
          <p className="text-red-600 text-sm mt-1">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

class SuspensePerformanceMonitor {
  private metrics: SuspenseMetrics;
  private config: SuspenseConfig;
  private loadStartTimes: Map<string, number>;

  constructor(config: Partial<SuspenseConfig> = {}) {
    this.metrics = {
      suspenseCount: 0,
      fallbackShown: 0,
      averageLoadTime: 0,
      errorRate: 0,
      chunkLoadTimes: new Map(),
      streamingMetrics: {
        ttfb: 0,
        firstChunk: 0,
        lastChunk: 0,
        totalChunks: 0,
      },
    };

    this.config = {
      timeout: 5000,
      retryCount: 3,
      enableStreaming: true,
      chunkSize: 64 * 1024, // 64KB
      priority: 'medium',
      preloadStrategy: 'viewport',
      ...config,
    };

    this.loadStartTimes = new Map();
  }

  startLoad(identifier: string): void {
    this.loadStartTimes.set(identifier, performance.now());
    this.metrics.suspenseCount++;
  }

  endLoad(identifier: string): number {
    const startTime = this.loadStartTimes.get(identifier);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.loadStartTimes.delete(identifier);

    // Update average load time
    const totalLoads = this.metrics.suspenseCount;
    this.metrics.averageLoadTime = 
      (this.metrics.averageLoadTime * (totalLoads - 1) + duration) / totalLoads;

    return duration;
  }

  recordFallback(): void {
    this.metrics.fallbackShown++;
  }

  recordError(): void {
    this.metrics.errorRate = 
      (this.metrics.errorRate * this.metrics.suspenseCount + 1) / 
      (this.metrics.suspenseCount + 1);
  }

  recordChunkLoad(chunkId: string, duration: number): void {
    this.metrics.chunkLoadTimes.set(chunkId, duration);
    this.metrics.streamingMetrics.totalChunks++;
    
    if (this.metrics.streamingMetrics.firstChunk === 0) {
      this.metrics.streamingMetrics.firstChunk = duration;
    }
    this.metrics.streamingMetrics.lastChunk = duration;
  }

  getMetrics(): SuspenseMetrics {
    return { ...this.metrics };
  }

  getConfig(): SuspenseConfig {
    return { ...this.config };
  }

  reset(): void {
    this.metrics = {
      suspenseCount: 0,
      fallbackShown: 0,
      averageLoadTime: 0,
      errorRate: 0,
      chunkLoadTimes: new Map(),
      streamingMetrics: {
        ttfb: 0,
        firstChunk: 0,
        lastChunk: 0,
        totalChunks: 0,
      },
    };
    this.loadStartTimes.clear();
  }
}

// Global monitor instance
const globalSuspenseMonitor = new SuspensePerformanceMonitor();

export const OptimizedSuspense: React.FC<OptimizedSuspenseProps> = ({
  children,
  fallback,
  config = {},
  onLoadStart,
  onLoadEnd,
  onError,
  identifier = `suspense-${Date.now()}`,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const monitor = useMemo(() => 
    new SuspensePerformanceMonitor(config), [config]
  );

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setShowFallback(true);
    monitor.startLoad(identifier);
    monitor.recordFallback();
    onLoadStart?.();
  }, [monitor, identifier, onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    const duration = monitor.endLoad(identifier);
    setIsLoading(false);
    setShowFallback(false);
    onLoadEnd?.(duration);
  }, [monitor, identifier, onLoadEnd]);

  const handleError = useCallback((error: Error) => {
    monitor.recordError();
    onError?.(error);
  }, [monitor, onError]);

  useEffect(() => {
    if (isLoading) {
      handleLoadStart();
    } else {
      handleLoadEnd();
    }
  }, [isLoading, handleLoadStart, handleLoadEnd]);

  const optimizedFallback = useMemo(() => {
    if (!showFallback) return null;
    
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }, [fallback, showFallback]);

  return (
    <ErrorBoundary onError={handleError}>
      <Suspense fallback={optimizedFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  children,
  stages,
  config = {},
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentStage < stages.length) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, 500); // 500ms between stages

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentStage, stages.length]);

  if (isComplete) {
    return <>{children}</>;
  }

  return (
    <OptimizedSuspense
      config={config}
      fallback={stages[currentStage] || stages[0]}
    >
      {children}
    </OptimizedSuspense>
  );
};

export const StreamingSSR: React.FC<StreamingSSRProps> = ({
  children,
  onChunkLoad,
}) => {
  const handleChunkLoad = useCallback((chunkId: string) => {
    const startTime = performance.now();
    
    // Simulate chunk load timing
    const duration = performance.now() - startTime;
    globalSuspenseMonitor.recordChunkLoad(chunkId, duration);
    onChunkLoad?.(chunkId, duration);
  }, [onChunkLoad]);

  useEffect(() => {
    // Simulate streaming chunks
    const chunks = ['header', 'content', 'sidebar', 'footer'];
    
    chunks.forEach((chunk, index) => {
      setTimeout(() => {
        handleChunkLoad(chunk);
      }, index * 200);
    });
  }, [handleChunkLoad]);

  return (
    <OptimizedSuspense
      config={{ enableStreaming: true }}
      identifier="streaming-ssr"
    >
      {children}
    </OptimizedSuspense>
  );
};

export const SuspenseMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<SuspenseMetrics>(
    globalSuspenseMonitor.getMetrics()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(globalSuspenseMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-3">Suspense Performance</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.suspenseCount}
          </div>
          <div className="text-sm text-gray-600">Total Suspense</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics.averageLoadTime.toFixed(0)}ms
          </div>
          <div className="text-sm text-gray-600">Avg Load Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {metrics.fallbackShown}
          </div>
          <div className="text-sm text-gray-600">Fallbacks Shown</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {(metrics.errorRate * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Error Rate</div>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Streaming Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>TTFB: {metrics.streamingMetrics.ttfb.toFixed(0)}ms</div>
          <div>First Chunk: {metrics.streamingMetrics.firstChunk.toFixed(0)}ms</div>
          <div>Last Chunk: {metrics.streamingMetrics.lastChunk.toFixed(0)}ms</div>
          <div>Total Chunks: {metrics.streamingMetrics.totalChunks}</div>
        </div>
      </div>
    </div>
  );
};

export const useSuspenseMetrics = () => {
  const [metrics, setMetrics] = useState<SuspenseMetrics>(
    globalSuspenseMonitor.getMetrics()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(globalSuspenseMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const resetMetrics = useCallback(() => {
    globalSuspenseMonitor.reset();
    setMetrics(globalSuspenseMonitor.getMetrics());
  }, []);

  return {
    metrics,
    resetMetrics,
    monitor: globalSuspenseMonitor,
  };
};

const SuspenseOptimizer = {
  OptimizedSuspense,
  ProgressiveLoader,
  StreamingSSR,
  SuspenseMetrics,
  useSuspenseMetrics,
  SuspensePerformanceMonitor,
};

export default SuspenseOptimizer;