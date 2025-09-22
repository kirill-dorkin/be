'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';

interface ImageMetrics {
  loadTime: number;
  size: number;
  format: string;
  dimensions: { width: number; height: number };
  cacheHit: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface ResponsiveBreakpoint {
  minWidth: number;
  width: number;
  height?: number;
  quality?: number;
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  breakpoints?: ResponsiveBreakpoint[];
  loading?: 'lazy' | 'eager';
  onLoad?: (metrics: ImageMetrics) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
}

interface LazyImageProps extends Omit<OptimizedImageProps, 'loading'> {
  threshold?: number;
  rootMargin?: string;
  enableIntersectionObserver?: boolean;
}

interface ImageSetProps {
  images: Array<{
    src: string;
    alt: string;
    priority?: boolean;
    breakpoints?: ResponsiveBreakpoint[];
  }>;
  layout?: 'grid' | 'masonry' | 'carousel';
  lazyLoad?: boolean;
  preloadCount?: number;
  onImageLoad?: (index: number, metrics: ImageMetrics) => void;
}

class ImagePerformanceMonitor {
  private metrics: Map<string, ImageMetrics> = new Map();
  private loadStartTimes: Map<string, number> = new Map();
  private observers: Set<(metrics: Map<string, ImageMetrics>) => void> = new Set();

  startLoad(src: string): void {
    this.loadStartTimes.set(src, performance.now());
  }

  endLoad(src: string, size: number, format: string, dimensions: { width: number; height: number }, cacheHit: boolean = false): void {
    const startTime = this.loadStartTimes.get(src);
    if (!startTime) return;

    const loadTime = performance.now() - startTime;
    const imagePriority = this.getPriorityFromSrc(src);

    const metrics: ImageMetrics = {
      loadTime,
      size,
      format,
      dimensions,
      cacheHit,
      priority: imagePriority,
    };

    this.metrics.set(src, metrics);
    this.loadStartTimes.delete(src);
    this.notifyObservers();
  }

  private getPriorityFromSrc(src: string): 'high' | 'medium' | 'low' {
    // Simple heuristic based on image path
    if (src.includes('hero') || src.includes('banner')) return 'high';
    if (src.includes('thumb') || src.includes('icon')) return 'low';
    return 'medium';
  }

  getMetrics(): Map<string, ImageMetrics> {
    return new Map(this.metrics);
  }

  subscribe(observer: (metrics: Map<string, ImageMetrics>) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.metrics));
  }

  getAverageLoadTime(): number {
    const times = Array.from(this.metrics.values()).map(m => m.loadTime);
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  }

  getTotalSize(): number {
    return Array.from(this.metrics.values()).reduce((sum, m) => sum + m.size, 0);
  }

  getCacheHitRate(): number {
    const total = this.metrics.size;
    if (total === 0) return 0;
    const cacheHits = Array.from(this.metrics.values()).filter(m => m.cacheHit).length;
    return (cacheHits / total) * 100;
  }
}

// Global monitor instance
const globalImageMonitor = new ImagePerformanceMonitor();

// Utility functions

const generateSizes = (breakpoints: ResponsiveBreakpoint[]): string => {
  return breakpoints
    .map((bp, index) => {
      if (index === breakpoints.length - 1) {
        return `${bp.width}px`;
      }
      return `(min-width: ${bp.minWidth}px) ${bp.width}px`;
    })
    .join(', ');
};

const getOptimalFormat = (): string => {
  // Check if browser supports modern formats
  const supportsWebP = typeof window !== 'undefined' && 
    document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  const supportsAVIF = typeof window !== 'undefined' && 
    document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;

  if (supportsAVIF) return 'avif';
  if (supportsWebP) return 'webp';
  return 'jpeg';
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  breakpoints,
  loading = 'lazy',
  onLoad,
  onError,
  className,
  style,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
}) => {
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const optimizedSrc = useMemo(() => {
    if (src.startsWith('data:') || src.startsWith('blob:')) return src;
    
    const url = new URL(src, window.location.origin);
    url.searchParams.set('f', getOptimalFormat());
    url.searchParams.set('q', quality.toString());
    
    if (width && !fill) url.searchParams.set('w', width.toString());
    if (height && !fill) url.searchParams.set('h', height.toString());
    
    return url.toString();
  }, [src, quality, width, height, fill]);

  const responsiveSizes = useMemo(() => {
    if (sizes) return sizes;
    if (breakpoints) return generateSizes(breakpoints);
    if (width) return `${width}px`;
    return '100vw';
  }, [sizes, breakpoints, width]);



  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const size = img.naturalWidth * img.naturalHeight * 4; // Rough size estimation
    const format = getOptimalFormat();
    const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
    
    globalImageMonitor.endLoad(src, size, format, dimensions);
    
    if (onLoad) {
      const metrics: ImageMetrics = {
        loadTime: performance.now(),
        size,
        format,
        dimensions,
        cacheHit: false, // Would need more sophisticated detection
        priority: priority ? 'high' : 'medium',
      };
      onLoad(metrics);
    }
  }, [src, onLoad, priority]);

  const handleError = useCallback(() => {
    setHasError(true);
    if (onError) {
      onError(new Error(`Failed to load image: ${src}`));
    }
  }, [src, onError]);

  useEffect(() => {
    if (priority || loading === 'eager') {
      globalImageMonitor.startLoad(src);
    }
  }, [src, priority, loading]);

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className || ''}`}
        style={{ width, height, ...style }}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <Image
      ref={imageRef}
      src={optimizedSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      priority={priority}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      sizes={responsiveSizes}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      className={className}
      style={{
        objectFit: fill ? objectFit : undefined,
        objectPosition: fill ? objectPosition : undefined,
        ...style,
      }}
    />
  );
};

export const LazyImage: React.FC<LazyImageProps> = ({
  threshold = 0.1,
  rootMargin = '50px',
  enableIntersectionObserver = true,
  ...props
}) => {
  const [isInView, setIsInView] = useState(!enableIntersectionObserver);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enableIntersectionObserver || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, enableIntersectionObserver, shouldLoad]);

  return (
    <div ref={containerRef} className="relative">
      {(isInView || shouldLoad) ? (
        <OptimizedImage {...props} loading="lazy" />
      ) : (
        <div 
          className="bg-gray-100 animate-pulse"
          style={{ 
            width: props.width, 
            height: props.height,
            aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined
          }}
        />
      )}
    </div>
  );
};

export const ImageSet: React.FC<ImageSetProps> = ({
  images,
  layout = 'grid',
  lazyLoad = true,
  preloadCount = 3,
  onImageLoad,
}) => {
  const handleImageLoad = useCallback((index: number, metrics: ImageMetrics) => {
    onImageLoad?.(index, metrics);
  }, [onImageLoad]);

  const layoutClasses = {
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    masonry: 'columns-1 md:columns-2 lg:columns-3 gap-4',
    carousel: 'flex overflow-x-auto gap-4 pb-4',
  };

  return (
    <div className={layoutClasses[layout]}>
      {images.map((image, index) => {
        const shouldPreload = index < preloadCount;
        const ImageComponent = lazyLoad && !shouldPreload ? LazyImage : OptimizedImage;

        return (
          <div key={`${image.src}-${index}`} className="relative">
            <ImageComponent
              {...image}
              priority={shouldPreload}
              onLoad={(metrics) => handleImageLoad(index, metrics)}
              className="w-full h-auto rounded-lg"
            />
          </div>
        );
      })}
    </div>
  );
};

export const ImageMetricsDisplay: React.FC = () => {
  const [metrics, setMetrics] = useState<Map<string, ImageMetrics>>(new Map());

  useEffect(() => {
    const unsubscribe = globalImageMonitor.subscribe(setMetrics);
    return unsubscribe;
  }, []);

  const averageLoadTime = globalImageMonitor.getAverageLoadTime();
  const totalSize = globalImageMonitor.getTotalSize();
  const cacheHitRate = globalImageMonitor.getCacheHitRate();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-3">Image Performance</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.size}
          </div>
          <div className="text-sm text-gray-600">Images Loaded</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {averageLoadTime.toFixed(0)}ms
          </div>
          <div className="text-sm text-gray-600">Avg Load Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {(totalSize / 1024 / 1024).toFixed(1)}MB
          </div>
          <div className="text-sm text-gray-600">Total Size</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {cacheHitRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Cache Hit Rate</div>
        </div>
      </div>
    </div>
  );
};

export const useImageMetrics = () => {
  const [metrics, setMetrics] = useState<Map<string, ImageMetrics>>(new Map());

  useEffect(() => {
    const unsubscribe = globalImageMonitor.subscribe(setMetrics);
    return unsubscribe;
  }, []);

  return {
    metrics,
    averageLoadTime: globalImageMonitor.getAverageLoadTime(),
    totalSize: globalImageMonitor.getTotalSize(),
    cacheHitRate: globalImageMonitor.getCacheHitRate(),
    monitor: globalImageMonitor,
  };
};

const ResponsiveImageOptimizer = {
  OptimizedImage,
  LazyImage,
  ImageSet,
  ImageMetricsDisplay,
  useImageMetrics,
  ImagePerformanceMonitor,
};

export default ResponsiveImageOptimizer;