"use client";

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

// Кэш для предзагруженных страниц
const prefetchCache = new Set<string>();
const routeCache = new Map<string, any>();

// Приоритетные маршруты для предзагрузки
const HIGH_PRIORITY_ROUTES = [
  '/',
  '/shop',
  '/admin',
  '/dashboard'
];

// Функция для предзагрузки маршрута
export const prefetchRoute = (href: string) => {
  if (prefetchCache.has(href)) return;
  
  prefetchCache.add(href);
  
  // Используем requestIdleCallback для неблокирующей предзагрузки
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }
};

// Хук для оптимизированной навигации
export const useOptimizedRouter = () => {
  const router = useRouter();
  
  const navigate = useCallback((href: string, options?: { replace?: boolean }) => {
    // Предзагружаем связанные маршруты
    const relatedRoutes = getRelatedRoutes(href);
    relatedRoutes.forEach(route => prefetchRoute(route));
    
    if (options?.replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
  }, [router]);
  
  const prefetch = useCallback((href: string) => {
    router.prefetch(href);
    prefetchRoute(href);
  }, [router]);
  
  return {
    navigate,
    prefetch,
    back: router.back,
    forward: router.forward,
    refresh: router.refresh
  };
};

// Получение связанных маршрутов для предзагрузки
function getRelatedRoutes(currentRoute: string): string[] {
  const routes: string[] = [];
  
  // Логика определения связанных маршрутов
  if (currentRoute === '/') {
    routes.push('/shop', '/about');
  } else if (currentRoute.startsWith('/shop')) {
    routes.push('/cart', '/checkout');
  } else if (currentRoute.startsWith('/admin')) {
    routes.push('/admin/dashboard', '/admin/users');
  }
  
  return routes;
}

// Хук для предзагрузки приоритетных маршрутов
export const usePrefetchPriority = () => {
  useEffect(() => {
    // Предзагружаем приоритетные маршруты после загрузки страницы
    const timer = setTimeout(() => {
      HIGH_PRIORITY_ROUTES.forEach(route => {
        prefetchRoute(route);
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
};

// Функция для очистки кэша
export const clearRouteCache = () => {
  prefetchCache.clear();
  routeCache.clear();
};

// Intersection Observer для предзагрузки ссылок в viewport
export const setupLinkPrefetching = () => {
  if (typeof window === 'undefined') return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          const href = link.getAttribute('href');
          if (href && href.startsWith('/')) {
            prefetchRoute(href);
          }
        }
      });
    },
    {
      rootMargin: '100px'
    }
  );
  
  // Наблюдаем за всеми ссылками
  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    observer.observe(link);
  });
  
  return () => observer.disconnect();
};