'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';

interface ImageMetrics {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  totalLoadTime: number;
  totalBytes: number;
  cacheHits: number;
  lazyLoadedImages: number;
  webpSupported: boolean;
  avifSupported: boolean;
  priorityImages: number;
  lcpImages: string[];
  clsScore: number;
  formatDistribution: Record<string, number>;
  compressionRatio: number;
  criticalPathImages: Set<string>;
}

interface ImageOptimizerConfig {
  enableWebP: boolean;
  enableAVIF: boolean;
  enableLazyLoading: boolean;
  enablePriorityHints: boolean;
  enableResponsiveImages: boolean;
  enableProgressiveJPEG: boolean;
  compressionQuality: number;
  enableCriticalImagePreload: boolean;
  enableImageCaching: boolean;
  enablePerformanceMonitoring: boolean;
  enableCLS: boolean;
  enableLCP: boolean;
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
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

interface ResponsiveImageProps extends OptimizedImageProps {
  breakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  aspectRatio?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

// Image performance monitor
class ImagePerformanceMonitor {
  private static instance: ImagePerformanceMonitor;
  private metrics: ImageMetrics;
  private observers: Set<(metrics: ImageMetrics) => void> = new Set();
  private imageLoadTimes = new Map<string, number>();
  private intersectionObserver?: IntersectionObserver;
  private performanceObserver?: PerformanceObserver;
  private config: ImageOptimizerConfig;
  private criticalImages = new Set<string>();
  private lcpObserver?: PerformanceObserver;

  constructor() {
    this.config = {
      enableWebP: true,
      enableAVIF: true,
      enableLazyLoading: true,
      enablePriorityHints: true,
      enableResponsiveImages: true,
      enableProgressiveJPEG: true,
      compressionQuality: 85,
      enableCriticalImagePreload: true,
      enableImageCaching: true,
      enablePerformanceMonitoring: true,
      enableCLS: true,
      enableLCP: true
    };

    this.metrics = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      averageLoadTime: 0,
      totalLoadTime: 0,
      totalBytes: 0,
      cacheHits: 0,
      lazyLoadedImages: 0,
      webpSupported: false,
      avifSupported: false,
      priorityImages: 0,
      lcpImages: [],
      clsScore: 0,
      formatDistribution: {},
      compressionRatio: 0,
      criticalPathImages: new Set()
    };

    this.detectFormatSupport();
    this.setupPerformanceObserver();
    this.setupIntersectionObserver();
    this.setupLCPObserver();
  }

  static getInstance(): ImagePerformanceMonitor {
    if (!ImagePerformanceMonitor.instance) {
      ImagePerformanceMonitor.instance = new ImagePerformanceMonitor();
    }
    return ImagePerformanceMonitor.instance;
  }

  private async detectFormatSupport(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Test WebP support
    const webpTestImage = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    this.metrics.webpSupported = await this.testImageFormat(webpTestImage);

    // Test AVIF support
    const avifTestImage = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    this.metrics.avifSupported = await this.testImageFormat(avifTestImage);

    this.notifyObservers();
  }

  private testImageFormat(dataUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = dataUrl;
    });
  }

  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && this.isImageResource(entry.name)) {
            this.trackImageLoad(entry as PerformanceResourceTiming);
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Failed to setup performance observer:', error);
    }
  }

  private setupLCPObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      this.lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          element?: HTMLImageElement;
        };
        
        if (lastEntry && lastEntry.element && lastEntry.element.tagName === 'IMG') {
          const src = lastEntry.element.src || lastEntry.element.currentSrc;
          if (src) {
            this.markAsLCPImage(src);
          }
        }
      });
      this.lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP Observer not supported:', error);
    }
  }

  private markAsLCPImage(src: string): void {
    this.criticalImages.add(src);
    if (!this.metrics.lcpImages.includes(src)) {
      this.metrics.lcpImages.push(src);
    }
    this.notifyObservers();
  }

  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined' || !window.IntersectionObserver) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.lazy === 'true') {
              this.metrics.lazyLoadedImages++;
              this.notifyObservers();
            }
          }
        });
      },
      { threshold: 0.1 }
    );
  }

  private isImageResource(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(url);
  }

  private trackImageLoad(entry: PerformanceResourceTiming): void {
    this.metrics.totalImages++;
    this.metrics.totalBytes += entry.transferSize || 0;
    
    if (entry.transferSize === 0) {
      this.metrics.cacheHits++;
    }

    const loadTime = entry.responseEnd - entry.requestStart;
    this.imageLoadTimes.set(entry.name, loadTime);
    
    // Update average load time
    const totalLoadTime = Array.from(this.imageLoadTimes.values())
      .reduce((sum, time) => sum + time, 0);
    this.metrics.averageLoadTime = totalLoadTime / this.imageLoadTimes.size;

    this.notifyObservers();
  }

  trackImageSuccess(): void {
    this.metrics.loadedImages++;
    this.notifyObservers();
  }

  trackImageError(): void {
    this.metrics.failedImages++;
    this.notifyObservers();
  }

  observeImage(element: HTMLElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(element);
    }
  }

  unobserveImage(element: HTMLElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
  }

  subscribe(observer: (metrics: ImageMetrics) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer({ ...this.metrics }));
  }

  getMetrics(): ImageMetrics {
    return { ...this.metrics };
  }

  getConfig(): ImageOptimizerConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<ImageOptimizerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  preloadCriticalImages(images: Array<{ src: string; priority: boolean }>): void {
    if (typeof window === 'undefined') return;

    images.forEach(({ src, priority }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      if (priority && this.config.enablePriorityHints) {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);
      
      if (priority) {
        this.criticalImages.add(src);
        this.metrics.criticalPathImages.add(src);
      }
    });
  }

  generateSrcSet(src: string, widths: number[]): string {
    return widths
      .map(width => `${this.optimizeImageUrl(src, { width })} ${width}w`)
      .join(', ');
  }

  optimizeImageUrl(src: string, options: { 
    width?: number; 
    height?: number; 
    quality?: number; 
    format?: string 
  }): string {
    if (typeof window === 'undefined') return src;
    
    const url = new URL(src, window.location.origin);
    
    if (options.width) url.searchParams.set('w', options.width.toString());
    if (options.height) url.searchParams.set('h', options.height.toString());
    if (options.quality) url.searchParams.set('q', options.quality.toString());
    if (options.format) url.searchParams.set('f', options.format);

    return url.toString();
  }

  trackPriorityImage(src: string): void {
    this.metrics.priorityImages++;
    this.criticalImages.add(src);
    this.notifyObservers();
  }

  isCriticalImage(src: string): boolean {
    return this.criticalImages.has(src);
  }

  // Analyze image performance
  analyzeImagePerformance(): {
    loadSuccessRate: number;
    cacheEfficiency: number;
    averageSize: number;
    formatOptimization: number;
    recommendations: string[];
  } {
    const loadSuccessRate = this.metrics.totalImages > 0 
      ? (this.metrics.loadedImages / this.metrics.totalImages) * 100 
      : 0;

    const totalRequests = this.metrics.loadedImages + this.metrics.failedImages;
    const cacheEfficiency = totalRequests > 0 
      ? (this.metrics.cacheHits / totalRequests) * 100 
      : 0;

    const averageSize = this.metrics.loadedImages > 0 
      ? this.metrics.totalBytes / this.metrics.loadedImages 
      : 0;

    const formatOptimization = (this.metrics.webpSupported ? 50 : 0) + 
                              (this.metrics.avifSupported ? 50 : 0);

    const recommendations: string[] = [];
    
    if (loadSuccessRate < 95) {
      recommendations.push('Investigate failed image loads and add fallbacks');
    }
    
    if (cacheEfficiency < 70) {
      recommendations.push('Improve image caching strategy');
    }
    
    if (averageSize > 100000) { // 100KB
      recommendations.push('Optimize image sizes and compression');
    }
    
    if (this.metrics.averageLoadTime > 1000) {
      recommendations.push('Implement lazy loading and image preloading');
    }
    
    if (!this.metrics.webpSupported && !this.metrics.avifSupported) {
      recommendations.push('Use modern image formats (WebP/AVIF) with fallbacks');
    }

    return {
      loadSuccessRate,
      cacheEfficiency,
      averageSize,
      formatOptimization,
      recommendations
    };
  }
}

// Optimized image component
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
  fill = false,
  className = '',
  style,
  onLoad,
  onError,
  loading = 'lazy',
  fetchPriority = 'auto'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadStartTime] = useState(performance.now());
  const imgRef = useRef<HTMLImageElement>(null);
  const monitor = ImagePerformanceMonitor.getInstance();
  const config = monitor.getConfig();

  useEffect(() => {
    if (priority) {
      monitor.trackPriorityImage(src);
    }
    
    if (imgRef.current) {
      if (loading === 'lazy') {
        imgRef.current.dataset.lazy = 'true';
      }
      monitor.observeImage(imgRef.current);
      
      return () => {
        if (imgRef.current) {
          monitor.unobserveImage(imgRef.current);
        }
      };
    }
  }, [loading, monitor, src, priority]);

  const handleLoad = useCallback(() => {
    const loadTime = performance.now() - loadStartTime;
    setIsLoaded(true);
    monitor.trackImageSuccess();
    
    // Track load time for performance metrics
    const metrics = monitor.getMetrics();
    metrics.totalLoadTime += loadTime;
    metrics.averageLoadTime = metrics.totalLoadTime / metrics.totalImages;
    
    onLoad?.();
  }, [loadStartTime, onLoad, monitor]);

  const handleError = useCallback(() => {
    setHasError(true);
    monitor.trackImageError();
    onError?.();
  }, [monitor, onError]);

  // Generate optimized src based on format support and config
  const optimizedSrc = useMemo(() => {
    const metrics = monitor.getMetrics();
    let optimizedUrl = src;
    
    if (config.enableAVIF && metrics.avifSupported && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png'))) {
      optimizedUrl = src.replace(/\.(jpg|jpeg|png)$/i, '.avif');
    } else if (config.enableWebP && metrics.webpSupported && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png'))) {
      optimizedUrl = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    // Apply URL optimization if enabled
    if (config.enablePerformanceMonitoring) {
      optimizedUrl = monitor.optimizeImageUrl(optimizedUrl, {
        width,
        height,
        quality: config.compressionQuality,
        format: config.enableAVIF && metrics.avifSupported ? 'avif' : 
                config.enableWebP && metrics.webpSupported ? 'webp' : undefined
      });
    }
    
    return optimizedUrl;
  }, [src, monitor, config, width, height]);

  // Generate responsive sizes if not provided and responsive images are enabled
  const responsiveSizes = useMemo(() => {
    if (sizes) return sizes;
    if (!config.enableResponsiveImages) return undefined;
    
    return fill ? '100vw' : 
           width ? `(max-width: ${width}px) 100vw, ${width}px` :
           '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  }, [sizes, config.enableResponsiveImages, fill, width]);

  // Determine effective loading strategy
  const effectiveLoading = config.enableLazyLoading ? loading : 'eager';
  const effectivePriority = config.enablePriorityHints ? priority : false;
  const effectiveFetchPriority = config.enablePriorityHints && priority ? 'high' : fetchPriority;

  if (hasError) {
    return (
      <div 
        className={`image-error bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      <Image
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={effectivePriority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={responsiveSizes}
        loading={effectiveLoading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        {...(config.enablePriorityHints && { fetchPriority: effectiveFetchPriority })}
      />
      
      {!isLoaded && placeholder === 'empty' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {config.enableCLS && monitor.isCriticalImage(src) && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            aspectRatio: width && height ? `${width}/${height}` : undefined
          }}
        />
      )}
    </div>
  );
};

// Responsive image component
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  breakpoints = { mobile: 640, tablet: 768, desktop: 1024 },
  aspectRatio = '16/9',
  objectFit = 'cover',
  sizes: customSizes,
  ...props
}) => {
  const generateSizes = useCallback(() => {
    if (customSizes) return customSizes;
    
    return `(max-width: ${breakpoints.mobile}px) 100vw, ` +
           `(max-width: ${breakpoints.tablet}px) 50vw, ` +
           `(max-width: ${breakpoints.desktop}px) 33vw, ` +
           '25vw';
  }, [customSizes, breakpoints]);

  return (
    <div 
      className="responsive-image-container"
      style={{ 
        aspectRatio,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <OptimizedImage
        {...props}
        fill
        sizes={generateSizes()}
        style={{ 
          objectFit,
          ...props.style 
        }}
      />
    </div>
  );
};

// Image gallery with lazy loading
export const ImageGallery: React.FC<{
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  columns?: number;
  gap?: number;
  lazyLoad?: boolean;
}> = ({ 
  images, 
  columns = 3, 
  gap = 16, 
  lazyLoad = true 
}) => {
  return (
    <div 
      className="image-gallery"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading={lazyLoad && index > 2 ? 'lazy' : 'eager'}
          priority={index < 3}
          className="gallery-image"
        />
      ))}
    </div>
  );
};

// Image metrics display
export const ImageMetrics: React.FC<{
  showDetails?: boolean;
}> = ({ showDetails = false }) => {
  const [metrics, setMetrics] = useState<ImageMetrics>(() => 
    ImagePerformanceMonitor.getInstance().getMetrics()
  );
  const [analysis, setAnalysis] = useState(() => 
    ImagePerformanceMonitor.getInstance().analyzeImagePerformance()
  );

  useEffect(() => {
    const monitor = ImagePerformanceMonitor.getInstance();
    
    const unsubscribe = monitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setAnalysis(monitor.analyzeImagePerformance());
    });

    return unsubscribe;
  }, []);

  return (
    <div className="image-metrics p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Image Performance</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="metric">
          <div className="text-sm text-gray-600">Total Images</div>
          <div className="text-lg font-bold">{metrics.totalImages}</div>
        </div>
        
        <div className="metric">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-lg font-bold text-green-600">
            {analysis.loadSuccessRate.toFixed(1)}%
          </div>
        </div>
        
        <div className="metric">
          <div className="text-sm text-gray-600">Cache Hit Rate</div>
          <div className="text-lg font-bold text-blue-600">
            {analysis.cacheEfficiency.toFixed(1)}%
          </div>
        </div>
        
        <div className="metric">
          <div className="text-sm text-gray-600">Avg Load Time</div>
          <div className="text-lg font-bold">
            {metrics.averageLoadTime.toFixed(0)}ms
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="details grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="metric">
            <div className="text-sm text-gray-600">Total Size</div>
            <div className="text-lg font-bold">
              {(metrics.totalBytes / 1024 / 1024).toFixed(1)} MB
            </div>
          </div>
          <div className="metric">
            <div className="text-sm text-gray-600">Lazy Loaded</div>
            <div className="text-lg font-bold">{metrics.lazyLoadedImages}</div>
          </div>
          <div className="metric">
            <div className="text-sm text-gray-600">WebP Support</div>
            <div className={`text-lg font-bold ${metrics.webpSupported ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.webpSupported ? 'Yes' : 'No'}
            </div>
          </div>
          <div className="metric">
            <div className="text-sm text-gray-600">AVIF Support</div>
            <div className={`text-lg font-bold ${metrics.avifSupported ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.avifSupported ? 'Yes' : 'No'}
            </div>
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

// Hook for image metrics
export function useImageMetrics() {
  const [metrics, setMetrics] = useState<ImageMetrics>(() => 
    ImagePerformanceMonitor.getInstance().getMetrics()
  );

  useEffect(() => {
    const monitor = ImagePerformanceMonitor.getInstance();
    const unsubscribe = monitor.subscribe(setMetrics);
    return unsubscribe;
  }, []);

  return metrics;
}

// Hook for lazy loading images
export function useLazyImage(src: string, options: { threshold?: number } = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { threshold = 0.1 } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  useEffect(() => {
    if (isInView && !isLoaded) {
      const img = new window.Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [isInView, isLoaded, src]);

  return { imgRef, isLoaded, isInView };
}

// Main ImageOptimizer component
export const ImageOptimizer: React.FC = () => {
  return (
    <div className="image-optimizer">
      <ImageMetrics showDetails={true} />
    </div>
  );
};

export default ImageOptimizer;