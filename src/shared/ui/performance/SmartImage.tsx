'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  enableWebP?: boolean;
  enableAVIF?: boolean;
  preloadOnVisible?: boolean;
  criticalViewport?: boolean;
}

interface PerformanceMonitor {
  reportImageLoad: (metric: ImagePerformanceMetrics) => void;
}

declare global {
  interface Window {
    __performanceMonitor?: PerformanceMonitor;
  }
}

interface ImagePerformanceMetrics {
  loadTime: number;
  size: number;
  format: string;
  cached: boolean;
}

export default function SmartImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc,
  enableWebP = true,
  enableAVIF = true,
  preloadOnVisible = false,
  criticalViewport = false,
  ...props
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [metrics, setMetrics] = useState<ImagePerformanceMetrics | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const loadStartTime = useRef<number>(0);

  // Generate optimized src with format detection
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (typeof window === 'undefined') return originalSrc;

    // Check browser support for modern formats
    const supportsAVIF = enableAVIF && CSS.supports('image-rendering', 'pixelated');
    const supportsWebP = enableWebP && document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;

    // For Next.js Image component, format optimization is handled automatically
    // But we can add query parameters for additional optimization
    const url = new URL(originalSrc, window.location.origin);
    
    if (quality !== 75) {
      url.searchParams.set('q', quality.toString());
    }

    if (supportsAVIF && enableAVIF) {
      url.searchParams.set('f', 'avif');
    } else if (supportsWebP && enableWebP) {
      url.searchParams.set('f', 'webp');
    }

    return url.toString();
  }, [quality, enableWebP, enableAVIF]);

  // Handle image load
  const handleLoad = useCallback(() => {
    const loadTime = performance.now() - loadStartTime.current;
    
    setIsLoaded(true);
    setHasError(false);

    // Collect performance metrics
    if (imageRef.current) {
      const metrics: ImagePerformanceMetrics = {
        loadTime,
        size: 0, // Will be updated if we can get the actual size
        format: currentSrc.includes('f=avif') ? 'avif' : 
                currentSrc.includes('f=webp') ? 'webp' : 'original',
        cached: loadTime < 50 // Assume cached if very fast
      };

      setMetrics(metrics);

      // Report to performance monitoring
      if (typeof window !== 'undefined' && window.__performanceMonitor) {
        window.__performanceMonitor.reportImageLoad(metrics);
      }
    }

    onLoad?.();
  }, [currentSrc, onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true);
    
    // Try fallback src if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      return;
    }

    onError?.();
  }, [fallbackSrc, currentSrc, onError]);

  // Start load timing
  const handleLoadStart = useCallback(() => {
    loadStartTime.current = performance.now();
  }, []);

  // Intersection Observer for preloading
  useEffect(() => {
    if (!preloadOnVisible || !imageRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Preload the image
            const img = document.createElement('img');
            img.src = getOptimizedSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(imageRef.current);

    return () => observer.disconnect();
  }, [preloadOnVisible, src, getOptimizedSrc]);

  // Update src when props change
  useEffect(() => {
    setCurrentSrc(getOptimizedSrc(src));
    setHasError(false);
    setIsLoaded(false);
  }, [src, getOptimizedSrc]);

  // Determine if image should be prioritized
  const shouldPrioritize = priority || criticalViewport;

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (
    fill ? '100vw' : 
    width ? `(max-width: 768px) 100vw, ${width}px` :
    '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  );

  return (
    <div className={`relative ${className || ''}`}>
      <Image
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={shouldPrioritize}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={responsiveSizes}
        loading={shouldPrioritize ? 'eager' : loading}
        onLoad={handleLoad}
        onError={handleError}
        onLoadStart={handleLoadStart}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
      
      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          Failed to load image
        </div>
      )}
      
      {/* Performance metrics (debug mode) */}
      {process.env.NODE_ENV === 'development' && metrics && (
        <div className="absolute top-0 left-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded">
          {metrics.loadTime.toFixed(0)}ms | {metrics.format} | {metrics.cached ? 'cached' : 'network'}
        </div>
      )}
    </div>
  );
}

// Hook for image performance monitoring
export function useImagePerformance() {
  const [metrics, setMetrics] = useState<ImagePerformanceMetrics[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set up global performance monitor
    window.__performanceMonitor = {
      reportImageLoad: (metric: ImagePerformanceMetrics) => {
        setMetrics(prev => [...prev, metric]);
      }
    };

    return () => {
      delete window.__performanceMonitor;
    };
  }, []);

  const getAverageLoadTime = useCallback(() => {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length;
  }, [metrics]);

  const getCacheHitRate = useCallback(() => {
    if (metrics.length === 0) return 0;
    const cached = metrics.filter(m => m.cached).length;
    return (cached / metrics.length) * 100;
  }, [metrics]);

  const getFormatDistribution = useCallback(() => {
    const distribution: Record<string, number> = {};
    metrics.forEach(m => {
      distribution[m.format] = (distribution[m.format] || 0) + 1;
    });
    return distribution;
  }, [metrics]);

  return {
    metrics,
    getAverageLoadTime,
    getCacheHitRate,
    getFormatDistribution
  };
}