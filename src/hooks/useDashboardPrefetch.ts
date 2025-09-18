'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface PrefetchOptions {
  enabled?: boolean;
  delay?: number;
}

const DASHBOARD_ROUTES = {
  admin: [
    '/admin/dashboard',
    '/admin/tasks',
    '/admin/users',
    '/admin/products',
    '/admin/orders',
    '/admin/categories',
    '/admin/devices',
    '/admin/services'
  ],
  worker: [
    '/worker/my-tasks'
  ]
};

export const useDashboardPrefetch = (options: PrefetchOptions = {}) => {
  const { enabled = true, delay = 100 } = options;
  const router = useRouter();
  const { data: session } = useSession();

  const prefetchRoutes = useCallback(async (routes: string[]) => {
    if (!enabled) return;
    
    // Добавляем небольшую задержку для избежания блокировки UI
    await new Promise(resolve => setTimeout(resolve, delay));
    
    for (const route of routes) {
      try {
        router.prefetch(route);
      } catch (error) {
        console.warn(`Failed to prefetch route: ${route}`, error);
      }
    }
  }, [router, enabled, delay]);

  const prefetchDashboardPages = useCallback(() => {
    if (!session?.user?.role) return;
    
    const routes = DASHBOARD_ROUTES[session.user.role as keyof typeof DASHBOARD_ROUTES] || [];
    prefetchRoutes(routes);
  }, [session?.user?.role, prefetchRoutes]);

  const prefetchSpecificRoute = useCallback((route: string) => {
    if (!enabled) return;
    
    setTimeout(() => {
      try {
        router.prefetch(route);
      } catch (error) {
        console.warn(`Failed to prefetch route: ${route}`, error);
      }
    }, delay);
  }, [router, enabled, delay]);

  // Автоматическая предзагрузка при монтировании компонента
  useEffect(() => {
    if (session?.user?.role) {
      prefetchDashboardPages();
    }
  }, [session?.user?.role, prefetchDashboardPages]);

  return {
    prefetchDashboardPages,
    prefetchSpecificRoute,
    prefetchRoutes
  };
};

export default useDashboardPrefetch;