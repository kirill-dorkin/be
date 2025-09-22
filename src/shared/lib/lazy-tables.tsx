import React from "react";
import { createLazyComponent, LazyWrapper } from "./code-splitting";
import { LoadingFallback } from "@/shared/ui/fallbacks";

// Lazy компоненты для тяжелых таблиц с оптимизированными fallback
export const LazyTaskTable = createLazyComponent(
  () => import("@/features/dashboard/TaskTable"),
  { 
    retryCount: 3,
    displayName: "TaskTable"
  }
);

export const LazyDeviceTable = createLazyComponent(
  () => import("@/features/dashboard/DeviceTable"),
  { 
    retryCount: 3,
    displayName: "DeviceTable"
  }
);

export const LazyCategoryTable = createLazyComponent(
  () => import("@/features/dashboard/CategoryTable"),
  { 
    retryCount: 3,
    displayName: "CategoryTable"
  }
);

export const LazyServiceTable = createLazyComponent(
  () => import("@/features/dashboard/ServiceTable"),
  { 
    retryCount: 3,
    displayName: "ServiceTable"
  }
);

// Обертки с типизированными fallback
export const TaskTableWithFallback: React.FC<any> = (props) => (
  <LazyWrapper fallbackType="table">
    <LazyTaskTable {...props} />
  </LazyWrapper>
);

export const DeviceTableWithFallback: React.FC<any> = (props) => (
  <LazyWrapper fallbackType="table">
    <LazyDeviceTable {...props} />
  </LazyWrapper>
);

export const CategoryTableWithFallback: React.FC<any> = (props) => (
  <LazyWrapper fallbackType="table">
    <LazyCategoryTable {...props} />
  </LazyWrapper>
);

export const ServiceTableWithFallback: React.FC<any> = (props) => (
  <LazyWrapper fallbackType="table">
    <LazyServiceTable {...props} />
  </LazyWrapper>
);

// Предзагрузка критических таблиц
export const preloadCriticalTables = () => {
  if (typeof window !== 'undefined') {
    // Предзагружаем только самые важные таблицы
    import("@/features/dashboard/TaskTable");
  }
};

// Предзагрузка таблиц по роли
export const preloadTablesByRole = async (role: string) => {
  if (role === "admin") {
    await Promise.all([
      import("@/features/dashboard/TaskTable"),
      import("@/features/dashboard/DeviceTable"),
      import("@/features/dashboard/CategoryTable"),
      import("@/features/dashboard/ServiceTable"),
    ]);
  } else if (role === "worker") {
    await Promise.all([
      import("@/features/dashboard/TaskTable"),
    ]);
  }
};

// Hook для динамической загрузки таблиц
export const useTableLoader = (tableName: string) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadTable = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      switch (tableName) {
        case 'tasks':
          await import("@/features/dashboard/TaskTable");
          break;
        case 'devices':
          await import("@/features/dashboard/DeviceTable");
          break;
        case 'categories':
          await import("@/features/dashboard/CategoryTable");
          break;
        case 'services':
          await import("@/features/dashboard/ServiceTable");
          break;
        default:
          throw new Error(`Unknown table: ${tableName}`);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [tableName]);

  return { loadTable, isLoading, error };
};

// Компонент для ленивой загрузки таблиц с индикатором прогресса
export const LazyTableLoader: React.FC<{
  tableName: string;
  children: React.ReactNode;
  showProgress?: boolean;
}> = ({ tableName, children, showProgress = true }) => {
  const { loadTable, isLoading, error } = useTableLoader(tableName);
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          loadTable();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [loadTable, isVisible]);

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Ошибка загрузки таблицы: {error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref}>
      {isLoading && showProgress && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Загрузка таблицы...</span>
        </div>
      )}
      {isVisible && !isLoading ? children : <LoadingFallback type="table" />}
    </div>
  );
};

export default {
  LazyTaskTable,
  LazyDeviceTable,
  LazyCategoryTable,
  LazyServiceTable,
  TaskTableWithFallback,
  DeviceTableWithFallback,
  CategoryTableWithFallback,
  ServiceTableWithFallback,
  preloadCriticalTables,
  preloadTablesByRole,
  useTableLoader,
  LazyTableLoader,
};