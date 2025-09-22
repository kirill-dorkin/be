'use client';

import React from 'react';
import { LazyWrapper } from './code-splitting';
import { PageProps } from '@/types';

// Lazy компоненты для основных роутов
export const LazyHomePage = React.lazy(() => 
  import("@/app/page").then(module => ({ default: module.default }))
);

export const LazyLoginPage = React.lazy(() => 
  import("@/app/login/page").then(module => ({ default: module.default }))
);

export const LazyRequestPage = React.lazy(() => 
  import("@/app/request/page").then(module => ({ default: module.default }))
);

// Lazy компоненты для admin роутов
export const LazyAdminDashboard = React.lazy(() => 
  import("@/app/admin/dashboard/page").then(module => ({ default: module.default }))
);

export const LazyAdminUsers = React.lazy(() => 
  import("@/app/admin/users/page").then(module => ({ default: module.default }))
);

export const LazyAdminTasks = React.lazy(() => 
  import("@/app/admin/tasks/page").then(module => ({ default: module.default }))
);

export const LazyAdminDevices = React.lazy(() => 
  import("@/app/admin/devices/page").then(module => ({ default: module.default }))
);

export const LazyAdminCategories = React.lazy(() => 
  import("@/app/admin/categories/page").then(module => ({ default: module.default }))
);

export const LazyAdminServices = React.lazy(() => 
  import("@/app/admin/services/page").then(module => ({ default: module.default }))
);

// Lazy компоненты для worker роутов
export const LazyWorkerMyTasks = React.lazy(() => 
  import("@/app/worker/my-tasks/page").then(module => ({ default: module.default }))
);

// Обертки с типизированными fallback
export const HomePageWithFallback: React.FC = () => (
  <LazyWrapper fallbackType="page">
    <LazyHomePage />
  </LazyWrapper>
);

export const LoginPageWithFallback: React.FC = () => (
  <LazyWrapper fallbackType="form">
    <LazyLoginPage />
  </LazyWrapper>
);

export const RequestPageWithFallback: React.FC = () => (
  <LazyWrapper fallbackType="form">
    <LazyRequestPage />
  </LazyWrapper>
);

// Admin роуты с fallback
export const AdminDashboardWithFallback: React.FC<PageProps> = (props) => (
  <LazyWrapper fallbackType="dashboard">
    <LazyAdminDashboard {...props} />
  </LazyWrapper>
);

export const AdminUsersWithFallback: React.FC<PageProps> = (props) => (
  <LazyWrapper fallbackType="table">
    <LazyAdminUsers {...props} />
  </LazyWrapper>
);

export const AdminTasksWithFallback: React.FC<PageProps> = (props) => (
  <LazyWrapper fallbackType="table">
    <LazyAdminTasks {...props} />
  </LazyWrapper>
);

export const AdminDevicesWithFallback: React.FC<PageProps> = (props) => (
  <LazyWrapper fallbackType="table">
    <LazyAdminDevices {...props} />
  </LazyWrapper>
);

export const AdminCategoriesWithFallback: React.FC<PageProps> = (props) => (
  <LazyWrapper fallbackType="table">
    <LazyAdminCategories {...props} />
  </LazyWrapper>
);

export const AdminServicesWithFallback: React.FC<PageProps> = (props) => (
  <LazyWrapper fallbackType="table">
    <LazyAdminServices {...props} />
  </LazyWrapper>
);

// Worker роуты с fallback
export const WorkerMyTasksWithFallback: React.FC<PageProps> = (props) => (
  <LazyWrapper fallbackType="table">
    <LazyWorkerMyTasks {...props} />
  </LazyWrapper>
);

// Предзагрузка критических роутов
export const preloadCriticalRoutes = () => {
  if (typeof window !== 'undefined') {
    // Предзагружаем только самые важные роуты
    import("@/app/page");
    import("@/app/login/page");
  }
};

// Предзагрузка роутов по роли
export const preloadRoutesByRole = async (role: string) => {
  if (role === "admin") {
    await Promise.all([
      import("@/app/page"),
      import("@/app/admin/dashboard/page"),
      import("@/app/admin/users/page"),
      import("@/app/admin/tasks/page"),
      import("@/app/admin/devices/page"),
      import("@/app/admin/categories/page"),
      import("@/app/admin/services/page"),
    ]);
  } else if (role === "worker") {
    await Promise.all([
      import("@/app/page"),
      import("@/app/worker/my-tasks/page"),
    ]);
  } else {
    await Promise.all([
      import("@/app/page"),
      import("@/app/login/page"),
      import("@/app/request/page"),
    ]);
  }
};

// Hook для динамической загрузки роутов
export const useRouteLoader = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadRoute = React.useCallback(async (routeName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      switch (routeName) {
        case 'home':
          await import("@/app/page");
          break;
        case 'login':
          await import("@/app/login/page");
          break;
        case 'request':
          await import("@/app/request/page");
          break;
        case 'admin-dashboard':
          await import("@/app/admin/dashboard/page");
          break;
        case 'admin-users':
          await import("@/app/admin/users/page");
          break;
        case 'admin-tasks':
          await import("@/app/admin/tasks/page");
          break;
        case 'admin-devices':
          await import("@/app/admin/devices/page");
          break;
        case 'admin-categories':
          await import("@/app/admin/categories/page");
          break;
        case 'admin-services':
          await import("@/app/admin/services/page");
          break;
        case 'worker-my-tasks':
          await import("@/app/worker/my-tasks/page");
          break;
        default:
          throw new Error(`Unknown route: ${routeName}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load route');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loadRoute, loading, error };
};