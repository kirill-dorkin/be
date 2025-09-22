'use client';

import React from 'react';
import { LazyWrapper } from './code-splitting';
import { PageProps, ClientPageProps } from '@/types';

// Обычные импорты вместо lazy для диагностики
import HomePage from '@/app/page';
import LoginPage from '@/app/login/page';
import RequestPage from '@/app/request/page';
import AdminDashboard from '@/app/admin/dashboard/page';
import AdminUsers from '@/app/admin/users/page';
import AdminTasks from '@/app/admin/tasks/page';
import AdminDevices from '@/app/admin/devices/page';
import AdminCategories from '@/app/admin/categories/page';
import AdminServices from '@/app/admin/services/page';
import WorkerMyTasks from '@/app/worker/my-tasks/page';

// Экспорт под теми же именами
export const LazyHomePage = HomePage;
export const LazyLoginPage = LoginPage;
export const LazyRequestPage = RequestPage;
export const LazyAdminDashboard = AdminDashboard;
export const LazyAdminUsers = AdminUsers;
export const LazyAdminTasks = AdminTasks;
export const LazyAdminDevices = AdminDevices;
export const LazyAdminCategories = AdminCategories;
export const LazyAdminServices = AdminServices;
export const LazyWorkerMyTasks = WorkerMyTasks;

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

export const AdminServicesWithFallback: React.FC = () => (
  <LazyWrapper fallbackType="table">
    <LazyAdminServices />
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