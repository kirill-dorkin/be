'use client';

import React, { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
  retryCount?: number;
  retryDelay?: number;
}

interface LazyComponentOptions {
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
  retryCount?: number;
  retryDelay?: number;
  preload?: boolean;
}

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
}

// Default loading component
const DefaultFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Default error boundary
const DefaultErrorBoundary: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-600 mb-4">
      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h3 className="text-lg font-semibold">Failed to load component</h3>
    </div>
    <p className="text-gray-600 mb-4 text-sm">{error.message}</p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

// Enhanced lazy loading with retry logic
export function createLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): LazyExoticComponent<T> {
  const {
    retryCount = 3,
    retryDelay = 1000,
    preload = false
  } = options;

  let retries = 0;

  const loadComponent = async (): Promise<{ default: T }> => {
    try {
      return await importFn();
    } catch (error) {
      if (retries < retryCount) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
        return loadComponent();
      }
      throw error;
    }
  };

  const LazyComponent = lazy(loadComponent);

  // Preload if requested
  if (preload && typeof window !== 'undefined') {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importFn().catch(() => {
        // Ignore preload errors
      });
    }, 100);
  }

  return LazyComponent;
}

// Error boundary class component
class LazyErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ComponentType<{ error: Error; retry: () => void }>;
    retryCount: number;
    retryDelay: number;
  },
  LoadingState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: LazyErrorBoundary['props']) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<LoadingState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyLoader Error:', error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  retry = () => {
    if (this.state.retryCount >= this.props.retryCount) {
      return;
    }

    this.setState({
      isLoading: true,
      error: null,
      retryCount: this.state.retryCount + 1
    });

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        isLoading: false,
        error: null
      });
    }, this.props.retryDelay);
  };

  render() {
    if (this.state.error) {
      const ErrorComponent = this.props.fallback;
      return <ErrorComponent error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

// Main LazyLoader component
export const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback: Fallback = DefaultFallback,
  errorBoundary: ErrorBoundary = DefaultErrorBoundary,
  retryCount = 3,
  retryDelay = 1000
}) => {
  return (
    <LazyErrorBoundary
      fallback={ErrorBoundary}
      retryCount={retryCount}
      retryDelay={retryDelay}
    >
      <Suspense fallback={<Fallback />}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
};

// Hook for dynamic imports with caching
export function useDynamicImport<T>(
  importFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [state, setState] = React.useState<{
    loading: boolean;
    data: T | null;
    error: Error | null;
  }>({
    loading: false,
    data: null,
    error: null
  });

  const importRef = React.useRef<Promise<T> | null>(null);

  const load = React.useCallback(async () => {
    if (importRef.current) {
      return importRef.current;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      importRef.current = importFn();
      const data = await importRef.current;
      setState({ loading: false, data, error: null });
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Import failed');
      setState({ loading: false, data: null, error: err });
      importRef.current = null;
      throw err;
    }
  }, deps);

  React.useEffect(() => {
    load().catch(() => {
      // Error is already handled in setState
    });
  }, [load]);

  return {
    ...state,
    load
  };
}

// Bundle analyzer helper
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return null;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  const bundleInfo = {
    scripts: scripts.map(script => ({
      src: (script as HTMLScriptElement).src,
      async: (script as HTMLScriptElement).async,
      defer: (script as HTMLScriptElement).defer
    })),
    styles: styles.map(style => ({
      href: (style as HTMLLinkElement).href,
      media: (style as HTMLLinkElement).media
    })),
    totalScripts: scripts.length,
    totalStyles: styles.length
  };

  console.group('Bundle Analysis');
  console.table(bundleInfo.scripts);
  console.table(bundleInfo.styles);
  console.log('Total Scripts:', bundleInfo.totalScripts);
  console.log('Total Styles:', bundleInfo.totalStyles);
  console.groupEnd();

  return bundleInfo;
}

// Performance monitoring for lazy loading
export function useLazyLoadingMetrics() {
  const [metrics, setMetrics] = React.useState<{
    totalLoads: number;
    successfulLoads: number;
    failedLoads: number;
    averageLoadTime: number;
    loadTimes: number[];
  }>({
    totalLoads: 0,
    successfulLoads: 0,
    failedLoads: 0,
    averageLoadTime: 0,
    loadTimes: []
  });

  const recordLoad = React.useCallback((success: boolean, loadTime: number) => {
    setMetrics(prev => {
      const newLoadTimes = [...prev.loadTimes, loadTime];
      const newTotalLoads = prev.totalLoads + 1;
      const newSuccessfulLoads = prev.successfulLoads + (success ? 1 : 0);
      const newFailedLoads = prev.failedLoads + (success ? 0 : 1);
      const newAverageLoadTime = newLoadTimes.reduce((a, b) => a + b, 0) / newLoadTimes.length;

      return {
        totalLoads: newTotalLoads,
        successfulLoads: newSuccessfulLoads,
        failedLoads: newFailedLoads,
        averageLoadTime: newAverageLoadTime,
        loadTimes: newLoadTimes.slice(-100) // Keep last 100 measurements
      };
    });
  }, []);

  const getSuccessRate = React.useCallback(() => {
    return metrics.totalLoads > 0 ? (metrics.successfulLoads / metrics.totalLoads) * 100 : 0;
  }, [metrics]);

  return {
    metrics,
    recordLoad,
    getSuccessRate
  };
}

export default LazyLoader;