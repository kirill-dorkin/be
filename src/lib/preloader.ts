'use client';

interface PreloadConfig {
  priority?: 'high' | 'low';
  as?: 'script' | 'style' | 'image' | 'font' | 'fetch';
  crossOrigin?: 'anonymous' | 'use-credentials';
  type?: string;
}

interface IntersectionConfig {
  threshold?: number;
  rootMargin?: string;
}

class IntelligentPreloader {
  private preloadedUrls = new Set<string>();
  private observer: IntersectionObserver | null = null;
  private connectionType: string = 'unknown';
  private isSlowConnection = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.detectConnection();
      this.setupIntersectionObserver();
    }
  }

  private detectConnection() {
    // @ts-expect-error - navigator.connection может не существовать
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      this.connectionType = connection.effectiveType || 'unknown';
      this.isSlowConnection = ['slow-2g', '2g', '3g'].includes(this.connectionType);
    }
  }

  private setupIntersectionObserver(config: IntersectionConfig = {}) {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const href = element.getAttribute('data-preload-href');
            const config = JSON.parse(element.getAttribute('data-preload-config') || '{}');
            
            if (href && !this.preloadedUrls.has(href)) {
              this.preloadResource(href, config);
            }
          }
        });
      },
      {
        threshold: config.threshold || 0.1,
        rootMargin: config.rootMargin || '50px',
      }
    );
  }

  // Предзагрузка ресурса
  preloadResource(url: string, config: PreloadConfig = {}) {
    if (this.preloadedUrls.has(url) || typeof window === 'undefined') return;

    // Пропускаем предзагрузку на медленных соединениях для некритичных ресурсов
    if (this.isSlowConnection && config.priority !== 'high') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    if (config.as) link.as = config.as;
    if (config.crossOrigin) link.crossOrigin = config.crossOrigin;
    if (config.type) link.type = config.type;

    // Добавляем fetchpriority для современных браузеров
    if (config.priority && 'fetchPriority' in link) {
      (link as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = config.priority;
    }

    document.head.appendChild(link);
    this.preloadedUrls.add(url);
  }

  // Предзагрузка страницы
  preloadPage(href: string) {
    if (this.preloadedUrls.has(href) || this.isSlowConnection) return;

    this.preloadResource(href, { as: 'fetch', priority: 'low' });
  }

  // Предзагрузка изображения с приоритетом
  preloadImage(src: string, priority: 'high' | 'low' = 'low') {
    this.preloadResource(src, { as: 'image', priority });
  }

  // Предзагрузка шрифта
  preloadFont(href: string, type: string = 'font/woff2') {
    this.preloadResource(href, { 
      as: 'font', 
      type, 
      crossOrigin: 'anonymous',
      priority: 'high'
    });
  }

  // Предзагрузка критических стилей
  preloadCSS(href: string) {
    this.preloadResource(href, { as: 'style', priority: 'high' });
  }

  // Предзагрузка скрипта
  preloadScript(src: string, priority: 'high' | 'low' = 'low') {
    this.preloadResource(src, { as: 'script', priority });
  }

  // Наблюдение за элементом для ленивой предзагрузки
  observeElement(element: HTMLElement, href: string, config: PreloadConfig = {}) {
    if (!this.observer) return;

    element.setAttribute('data-preload-href', href);
    element.setAttribute('data-preload-config', JSON.stringify(config));
    this.observer.observe(element);
  }

  // Отключение наблюдения
  unobserveElement(element: HTMLElement) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  // Предзагрузка на основе пользовательского поведения
  preloadOnHover(element: HTMLElement, href: string, config: PreloadConfig = {}) {
    let timeoutId: NodeJS.Timeout;

    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        this.preloadResource(href, config);
      }, 100); // Задержка для избежания случайных наведений
    };

    const handleMouseLeave = () => {
      clearTimeout(timeoutId);
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Возвращаем функцию очистки
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeoutId);
    };
  }

  // Предзагрузка критических ресурсов для страницы
  preloadCriticalResources(resources: Array<{ url: string; config: PreloadConfig }>) {
    resources.forEach(({ url, config }) => {
      this.preloadResource(url, { ...config, priority: 'high' });
    });
  }

  // Очистка ресурсов
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.preloadedUrls.clear();
  }

  // Получение статистики
  getStats() {
    return {
      preloadedCount: this.preloadedUrls.size,
      connectionType: this.connectionType,
      isSlowConnection: this.isSlowConnection,
    };
  }
}

// Синглтон для глобального использования
export const preloader = new IntelligentPreloader();

// Хук для использования в React компонентах
export const usePreloader = () => {
  return preloader;
};

// Утилиты для предзагрузки
export const preloadUtils = {
  // Предзагрузка маршрута Next.js
  preloadRoute: (href: string) => {
    if (typeof window !== 'undefined' && window.__NEXT_DATA__) {
      preloader.preloadPage(href);
    }
  },

  // Предзагрузка изображений в viewport
  preloadImagesInViewport: () => {
    if (typeof window === 'undefined') return;

    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      const src = img.getAttribute('data-src');
      if (src) {
        preloader.observeElement(img as HTMLElement, src, { as: 'image' });
      }
    });
  },

  // Предзагрузка на основе навигации
  setupNavigationPreload: () => {
    if (typeof window === 'undefined') return;

    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        preloader.preloadOnHover(link as HTMLElement, href, { as: 'fetch' });
      }
    });
  },
};

export default preloader;