// Автогенерированный файл для оптимизированных изображений
// Не редактировать вручную - используйте npm run images:optimize

export interface OptimizedImageSources {
  avif: string;
  webp: string;
  jpeg: string;
}

export interface ResponsiveImageSet {
  mobile: OptimizedImageSources;
  tablet: OptimizedImageSources;
  desktop: OptimizedImageSources;
  xl: OptimizedImageSources;
  blur: string;
}

// Утилита для получения srcSet
export function getSrcSet(imageName: string, format: 'avif' | 'webp' | 'jpeg' = 'webp'): string {
  const basePath = '/images/optimized';
  return [
    `${basePath}/${imageName}-mobile.${format} 320w`,
    `${basePath}/${imageName}-tablet.${format} 768w`,
    `${basePath}/${imageName}-desktop.${format} 1024w`,
    `${basePath}/${imageName}-xl.${format} 1920w`
  ].join(', ');
}

// Утилита для получения sizes атрибута
export function getSizes(breakpoints?: string): string {
  return breakpoints || '(max-width: 320px) 320px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1920px';
}

// Утилита для получения blur placeholder
export function getBlurDataURL(imageName: string): string {
  return `/images/optimized/${imageName}-blur.webp`;
}

// Компонент Picture для современных браузеров
export function getPictureProps(imageName: string) {
  return {
    sources: [
      {
        srcSet: getSrcSet(imageName, 'avif'),
        type: 'image/avif'
      },
      {
        srcSet: getSrcSet(imageName, 'webp'),
        type: 'image/webp'
      }
    ],
    img: {
      src: `/images/optimized/${imageName}-desktop.jpg`,
      srcSet: getSrcSet(imageName, 'jpeg')
    }
  };
}
