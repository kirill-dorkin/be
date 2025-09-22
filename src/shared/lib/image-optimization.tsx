'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

// Типы для оптимизации изображений
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
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

interface ImageMetrics {
  src: string;
  loadTime: number;
  size: number;
  format: string;
  status: 'loading' | 'loaded' | 'error';
}

// Генератор blur placeholder
export const generateBlurDataURL = (width: number = 8, height: number = 8): string => {
  if (typeof window === 'undefined') {
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Создаем градиент для blur эффекта
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

// Утилиты для WebP/AVIF поддержки
export const formatSupport = {
  webp: false,
  avif: false,
  
  async checkSupport() {
    if (typeof window === 'undefined') return;
    
    // Проверка WebP
    const webpCanvas = document.createElement('canvas');
    webpCanvas.width = 1;
    webpCanvas.height = 1;
    this.webp = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    // Проверка AVIF
    try {
      const avifCanvas = document.createElement('canvas');
      avifCanvas.width = 1;
      avifCanvas.height = 1;
      this.avif = avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch {
      this.avif = false;
    }
  },
  
  getOptimalFormat(): 'avif' | 'webp' | 'jpeg' {
    if (this.avif) return 'avif';
    if (this.webp) return 'webp';
    return 'jpeg';
  }
};

// Оптимизированный компонент изображения
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  className = '',
  fill = false,
  style,
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [loadTime, setLoadTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    setLoadTime(startTime);
  }, [src]);

  const handleLoad = () => {
    const endTime = performance.now();
    setImageStatus('loaded');
    setLoadTime(endTime - loadTime);
    onLoad?.();
  };

  const handleError = () => {
    setImageStatus('error');
    onError?.();
  };

  // Автоматическая генерация sizes для responsive изображений
  const responsiveSizes = sizes || (
    fill 
      ? '100vw'
      : width 
        ? `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`
        : '100vw'
  );

  // Автоматическая генерация blur placeholder
  const defaultBlurDataURL = blurDataURL || (
    typeof window !== 'undefined' && width && height
      ? generateBlurDataURL(Math.min(width, 8), Math.min(height, 8))
      : undefined
  );

  const imageProps = {
    src,
    alt,
    quality,
    priority,
    placeholder: placeholder as any,
    blurDataURL: defaultBlurDataURL,
    sizes: responsiveSizes,
    className: `${className} ${imageStatus === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    style,
    onLoad: handleLoad,
    onError: handleError,
    ...(fill ? { fill: true } : { width, height }),
  };

  return <Image {...imageProps} />;
};

// Hook для мониторинга производительности изображений
export const useImageMetrics = () => {
  const [metrics, setMetrics] = useState<ImageMetrics[]>([]);

  const addMetric = (metric: ImageMetrics) => {
    setMetrics(prev => [...prev, metric]);
  };

  const getAverageLoadTime = () => {
    const loadedMetrics = metrics.filter(m => m.status === 'loaded');
    if (loadedMetrics.length === 0) return 0;
    
    return loadedMetrics.reduce((sum, m) => sum + m.loadTime, 0) / loadedMetrics.length;
  };

  const getErrorRate = () => {
    if (metrics.length === 0) return 0;
    const errorCount = metrics.filter(m => m.status === 'error').length;
    return (errorCount / metrics.length) * 100;
  };

  return {
    metrics,
    addMetric,
    averageLoadTime: getAverageLoadTime(),
    errorRate: getErrorRate(),
  };
};

// Компонент для lazy loading изображений
export const LazyImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  threshold = 0.1,
  ...props
}: OptimizedImageProps & { threshold?: number }) => {
  const [isInView, setIsInView] = useState(false);
  const [imgRef, setImgRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!imgRef || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(imgRef);

    return () => observer.disconnect();
  }, [imgRef, isInView, threshold]);

  return (
    <div 
      ref={setImgRef}
      className={`${className} ${!isInView ? 'bg-gray-200 animate-pulse' : ''}`}
      style={{ width, height }}
    >
      {isInView && (
        <OptimizedImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          {...props}
        />
      )}
    </div>
  );
};

// Компонент для адаптивных изображений
export const ResponsiveImage = ({
  src,
  alt,
  aspectRatio = '16/9',
  className = '',
  priority = false,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & { 
  aspectRatio?: string;
}) => {
  return (
    <div 
      className={`relative w-full ${className}`}
      style={{ aspectRatio }}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...props}
      />
    </div>
  );
};

// Утилиты для оптимизации изображений
export const imageOptimizationUtils = {
  // Генерация srcset для разных размеров
  generateSrcSet: (baseSrc: string, sizes: number[]) => {
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=85 ${size}w`)
      .join(', ');
  },

  // Определение оптимального формата
  getOptimalFormat: (userAgent: string): 'webp' | 'avif' | 'jpeg' => {
    if (userAgent.includes('Chrome') && userAgent.includes('Version/')) {
      return 'avif'; // Chrome поддерживает AVIF
    }
    if (userAgent.includes('Chrome') || userAgent.includes('Firefox')) {
      return 'webp'; // WebP поддержка
    }
    return 'jpeg'; // Fallback
  },

  // Расчет оптимального качества
  getOptimalQuality: (imageType: 'photo' | 'graphic' | 'icon'): number => {
    switch (imageType) {
      case 'photo': return 85;
      case 'graphic': return 90;
      case 'icon': return 95;
      default: return 85;
    }
  },

  // Предзагрузка критических изображений
  preloadCriticalImages: (imageSrcs: string[]) => {
    if (typeof window === 'undefined') return;

    imageSrcs.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      
      if (!document.querySelector(`link[href="${src}"]`)) {
        document.head.appendChild(link);
      }
    });
  },
};

// Компонент для мониторинга производительности изображений
export const ImagePerformanceMonitor = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const { metrics, averageLoadTime, errorRate } = useImageMetrics();

  useEffect(() => {
    // Логируем метрики производительности
    if (metrics.length > 0) {
      console.group('Image Performance Metrics');
      console.log(`Average Load Time: ${averageLoadTime.toFixed(2)}ms`);
      console.log(`Error Rate: ${errorRate.toFixed(2)}%`);
      console.log(`Total Images: ${metrics.length}`);
      console.groupEnd();
    }
  }, [metrics, averageLoadTime, errorRate]);

  return <>{children}</>;
};

export default {
  OptimizedImage,
  LazyImage,
  ResponsiveImage,
  ImagePerformanceMonitor,
  useImageMetrics,
  imageOptimizationUtils,
  generateBlurDataURL,
  formatSupport,
};