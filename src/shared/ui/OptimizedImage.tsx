'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import { getSrcSet, getSizes, getBlurDataURL, getPictureProps } from '@/shared/lib/optimized-images';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError' | 'sizes' | 'placeholder'> {
  // Основные свойства
  containerClassName?: string
  imageClassName?: string
  placeholderClassName?: string
  
  // Lazy loading
  threshold?: number
  rootMargin?: string
  
  // Placeholder и состояния
  showPlaceholder?: boolean
  placeholder?: React.ReactNode
  errorFallback?: React.ReactNode
  
  // Blur эффект
  blur?: boolean
  blurDataURL?: string
  
  // Callbacks
  onLoad?: () => void
  onError?: () => void
  onLoadComplete?: () => void
  
  // Оптимизация изображений
  useOptimized?: boolean
  imageName?: string
  sizes?: string
  breakpoints?: number[]
}

const OptimizedImage: React.FC<OptimizedImageProps> = (props) => {
  const {
    // Основные пропсы
    src,
    alt,
    width,
    height,
    priority = false,
    loading = 'lazy',
    
    // Дополнительные пропсы
    containerClassName,
    imageClassName,
    placeholderClassName,
    showPlaceholder = true,
    placeholder,
    errorFallback,
    blur = true,
    blurDataURL,
    onLoadComplete,
    onError,
    
    // Оптимизация изображений
    useOptimized = false,
    imageName,
    sizes,
    breakpoints,
    
    // Остальные пропсы
    className,
    ...imageProps
  } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer для ленивой загрузки
  useEffect(() => {
    if (priority || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoadComplete?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Определение источников изображения
  const getImageSources = () => {
    if (useOptimized && imageName) {
      try {
        return getPictureProps(imageName);
      } catch (error) {
        console.warn(`Оптимизированные изображения для ${imageName} не найдены, используем fallback`);
        return null;
      }
    }
    return null;
  };

  // Генерация placeholder blur data URL
  const getOptimizedBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;
    if (!blur) return undefined;
    
    if (useOptimized && imageName) {
      try {
        return getBlurDataURL(imageName);
      } catch (error) {
        // Fallback к простому placeholder
      }
    }
    
    // Простой серый placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';
  };

  // Определение размеров для responsive изображений
  const getResponsiveSizes = () => {
    if (sizes) return sizes;
    
    // Автоматические размеры на основе ширины
    if (typeof width === 'number') {
      if (width <= 640) return '(max-width: 640px) 100vw, 640px';
      if (width <= 1024) return '(max-width: 1024px) 100vw, 1024px';
      return '(max-width: 1920px) 100vw, 1920px';
    }
    
    return '100vw';
  };

  if (hasError && errorFallback) {
    return <>{errorFallback}</>;
  }

  // Используем picture элемент для современных форматов
  if (useOptimized && imageName) {
    const pictureProps = getImageSources();
    
    if (pictureProps) {
      return (
        <div
          ref={imgRef}
          className={cn(
            'relative overflow-hidden',
            containerClassName
          )}
          style={{ width, height }}
        >
          {/* Placeholder */}
          {showPlaceholder && isLoading && (
            <div
              className={cn(
                'absolute inset-0 bg-gray-200 animate-pulse',
                'flex items-center justify-center',
                placeholderClassName
              )}
            >
              {placeholder || (
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          )}

          {/* Picture element с современными форматами */}
          {(isInView || priority) && (
            <picture className="block w-full h-full">
              {pictureProps.sources?.map((source, index) => (
                <source key={index} {...source} />
              ))}
              <img
                {...pictureProps.img}
                alt={alt}
                loading={loading === 'lazy' ? 'lazy' : undefined}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-300',
                  isLoading ? 'opacity-0' : 'opacity-100',
                  imageClassName,
                  className
                )}
                onLoad={handleLoad}
                onError={handleError}
              />
            </picture>
          )}

          {/* Индикатор ошибки */}
          {hasError && !errorFallback && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-sm">Не удалось загрузить изображение</p>
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  // Fallback к обычному Next.js Image
  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {showPlaceholder && isLoading && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse',
            'flex items-center justify-center',
            placeholderClassName
          )}
        >
          <svg
            className="w-8 h-8 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Основное изображение */}
      {(isInView || priority) && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          loading={loading}
          placeholder={blur ? 'blur' : 'empty'}
          blurDataURL={getOptimizedBlurDataURL()}
          sizes={getResponsiveSizes()}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            imageClassName,
            className
          )}
          {...imageProps}
        />
      )}

      {/* Индикатор ошибки */}
      {hasError && !errorFallback && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-sm">Не удалось загрузить изображение</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент для hero изображений с высоким приоритетом
export const HeroImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    priority={true}
    fetchPriority="high"
    loading="eager"
  />
);

// Компонент для изображений в карточках
export const CardImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    priority={false}
    fetchPriority="low"
    loading="lazy"
    showPlaceholder={true}
  />
);

// Компонент для аватаров
export const AvatarImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    priority={false}
    fetchPriority="low"
    loading="lazy"
    className={cn('rounded-full', props.className)}
  />
);

// Компонент для галереи изображений
export const GalleryImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    priority={false}
    fetchPriority="auto"
    loading="lazy"
    blur={true}
    showPlaceholder={true}
  />
);

export default OptimizedImage;