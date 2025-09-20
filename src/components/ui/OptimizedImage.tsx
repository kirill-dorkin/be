'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  // Расширенные опции производительности
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  
  // Опции отображения
  showPlaceholder?: boolean;
  placeholderClassName?: string;
  errorFallback?: React.ReactNode;
  
  // Опции оптимизации
  blur?: boolean;
  blurDataURL?: string;
  
  // Колбэки
  onLoadComplete?: () => void;
  onError?: () => void;
  
  // Дополнительные классы
  containerClassName?: string;
  imageClassName?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  loading = 'lazy',
  fetchPriority = 'auto',
  showPlaceholder = true,
  placeholderClassName,
  errorFallback,
  blur = true,
  blurDataURL,
  onLoadComplete,
  onError,
  containerClassName,
  imageClassName,
  className,
  ...props
}) => {
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

  // Генерация placeholder blur data URL
  const getBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;
    if (!blur) return undefined;
    
    // Простой серый placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';
  };

  // Определение размеров для responsive изображений
  const getSizes = () => {
    if (props.sizes) return props.sizes;
    
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
          blurDataURL={getBlurDataURL()}
          sizes={getSizes()}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            imageClassName,
            className
          )}
          style={{
            // @ts-expect-error - fetchPriority может не поддерживаться
            fetchPriority,
          }}
          {...props}
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