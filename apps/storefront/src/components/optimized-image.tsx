"use client";

import Image, { type ImageProps } from "next/image";
import React, { memo } from "react";

type OptimizedImageProps = ImageProps & {
  disableGoogleLens?: boolean;
  highQuality?: boolean;
};

/**
 * Оптимизированный компонент Image с максимальным качеством
 * - Автоматически добавляет fetchPriority для приоритетных изображений
 * - Использует decoding="async" для лучшей производительности
 * - Поддерживает максимальное качество для продуктовых фото
 * - Опционально отключает Google Lens / "Найти фото в интернете"
 */
const OptimizedImageComponent = ({
  priority,
  highQuality = false,
  disableGoogleLens = false,
  className,
  ...props
}: OptimizedImageProps) => {
  const imageClassName = disableGoogleLens
    ? `${className || ""} disable-image-search`.trim()
    : className;

  const imageProps = disableGoogleLens
    ? {
        ...props,
        "data-nosnippet": "",
        "data-no-image-index": "",
        onContextMenu: (e: React.MouseEvent) => {
          e.preventDefault();

          return false;
        },
      }
    : props;

  return (
    <Image
      {...imageProps}
      className={imageClassName}
      priority={priority}
      fetchPriority={priority ? "high" : "auto"}
      alt={props.alt || ""}
      decoding={priority ? "sync" : "async"}
      // Для высокого качества отключаем placeholder blur чтобы не терять детали
      placeholder={highQuality ? undefined : props.placeholder}
      // Отключаем dragging изображений для товаров
      draggable={disableGoogleLens ? false : props.draggable}
    />
  );
};

// Мемоизация компонента - используется повсеместно на каждой странице
export const OptimizedImage = memo(
  OptimizedImageComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.src === nextProps.src &&
      prevProps.alt === nextProps.alt &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.priority === nextProps.priority &&
      prevProps.highQuality === nextProps.highQuality &&
      prevProps.disableGoogleLens === nextProps.disableGoogleLens &&
      prevProps.className === nextProps.className
    );
  },
);
