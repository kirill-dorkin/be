import { Suspense } from "react";

interface PageSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  priority?: "high" | "medium" | "low";
}

// Оптимизированный скелетон для быстрой отрисовки
const DefaultSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4">
    <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-32 bg-gray-200 rounded-lg"></div>
      <div className="h-32 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

// Минимальный скелетон для критических элементов
const MinimalSkeleton = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Полный скелетон для сложных страниц
const FullSkeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    {/* Header skeleton */}
    <div className="flex items-center space-x-4">
      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded w-2/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-11/12"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      </div>
    </div>
    
    {/* Cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-40 bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  </div>
);

export function PageSuspense({ children, fallback, priority = "medium" }: PageSuspenseProps) {
  // Выбираем подходящий скелетон в зависимости от приоритета
  const getSkeleton = () => {
    if (fallback) return fallback;
    
    switch (priority) {
      case "high":
        return <MinimalSkeleton />;
      case "low":
        return <FullSkeleton />;
      default:
        return <DefaultSkeleton />;
    }
  };

  return (
    <Suspense fallback={getSkeleton()}>
      {children}
    </Suspense>
  );
}

// Специализированные компоненты для разных типов контента
export function NavigationSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="h-16 bg-gray-100 animate-pulse flex items-center px-4">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
      </div>
    }>
      {children}
    </Suspense>
  );
}

export function ContentSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DefaultSkeleton />}>
      {children}
    </Suspense>
  );
}

export function SidebarSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="w-64 bg-gray-50 animate-pulse p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded"></div>
        ))}
      </div>
    }>
      {children}
    </Suspense>
  );
}