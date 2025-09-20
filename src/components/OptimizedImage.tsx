"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 85,
  placeholder = "blur",
  blurDataURL,
  className = "",
  sizes,
  fill = false,
  loading = "lazy",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState(src);

  // Генерируем blur placeholder если не предоставлен
  const defaultBlurDataURL = 
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

  // Определяем оптимальные размеры на основе viewport
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateImageSrc = () => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const screenWidth = window.innerWidth;
      
      // Оптимизируем качество в зависимости от устройства
      let optimalQuality = quality;
      if (devicePixelRatio > 2) {
        optimalQuality = Math.max(60, quality - 15); // Снижаем качество для retina
      }
      
      // Добавляем параметры оптимизации к URL
      const url = new URL(src, window.location.origin);
      url.searchParams.set("q", optimalQuality.toString());
      
      if (width && height) {
        // Адаптируем размеры под DPR
        const optimalWidth = Math.min(width * devicePixelRatio, screenWidth * 2);
        url.searchParams.set("w", optimalWidth.toString());
      }
      
      setOptimizedSrc(url.toString());
    };

    updateImageSrc();
    window.addEventListener("resize", updateImageSrc);
    
    return () => window.removeEventListener("resize", updateImageSrc);
  }, [src, width, height, quality]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Fallback изображение при ошибке
  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  const imageProps = {
    src: optimizedSrc,
    alt,
    quality,
    priority,
    placeholder,
    blurDataURL: blurDataURL || defaultBlurDataURL,
    className: `transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"} ${className}`,
    onLoad: handleLoad,
    onError: handleError,
    loading: priority ? "eager" : loading,
    sizes: sizes || (fill ? "100vw" : undefined),
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width || 800}
      height={height || 600}
    />
  );
}

// Специализированные компоненты для разных случаев использования
export function HeroImage(props: Omit<OptimizedImageProps, "priority" | "loading">) {
  return (
    <OptimizedImage
      {...props}
      priority={true}
      loading="eager"
      quality={90}
      sizes="100vw"
    />
  );
}

export function ThumbnailImage(props: Omit<OptimizedImageProps, "quality" | "loading">) {
  return (
    <OptimizedImage
      {...props}
      quality={75}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

export function AvatarImage(props: Omit<OptimizedImageProps, "quality" | "sizes">) {
  return (
    <OptimizedImage
      {...props}
      quality={80}
      sizes="(max-width: 768px) 64px, 96px"
      className={`rounded-full ${props.className || ""}`}
    />
  );
}