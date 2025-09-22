import React from "react";
import { cn } from "@/shared/lib/utils";

// Базовый скелетон
export const Skeleton: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className, children }) => (
  <div
    className={cn(
      "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded",
      className
    )}
    style={{
      animation: "shimmer 1.5s ease-in-out infinite",
    }}
  >
    {children}
  </div>
);

// Fallback для таблиц
export const TableFallback: React.FC = () => (
  <div className="w-full space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="border rounded-lg">
      {/* Заголовок таблицы */}
      <div className="border-b p-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
      {/* Строки таблицы */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b last:border-b-0 p-4">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Fallback для дашборда
export const DashboardFallback: React.FC = () => (
  <div className="space-y-6">
    {/* Заголовок */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    
    {/* Метрики */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
    
    {/* Графики */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  </div>
);

// Fallback для календаря
export const CalendarFallback: React.FC = () => (
  <div className="border rounded-lg p-4 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 42 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-8" />
      ))}
    </div>
  </div>
);

// Fallback для карусели
export const CarouselFallback: React.FC = () => (
  <div className="relative">
    <div className="flex space-x-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-64 space-y-2">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
    <div className="absolute inset-y-0 left-0 flex items-center">
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <div className="absolute inset-y-0 right-0 flex items-center">
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);

// Fallback для страниц
export const PageFallback: React.FC = () => (
  <div className="space-y-6 p-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      ))}
    </div>
  </div>
);

// Fallback для форм
export const FormFallback: React.FC = () => (
  <div className="space-y-6 max-w-md">
    <div className="space-y-2">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
    </div>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <Skeleton className="h-10 w-32" />
  </div>
);

// Универсальный fallback с анимацией загрузки
export const LoadingFallback: React.FC<{
  type?: "table" | "dashboard" | "calendar" | "carousel" | "page" | "form";
  className?: string;
}> = ({ type = "page", className }) => {
  const fallbacks = {
    table: TableFallback,
    dashboard: DashboardFallback,
    calendar: CalendarFallback,
    carousel: CarouselFallback,
    page: PageFallback,
    form: FormFallback,
  };

  const FallbackComponent = fallbacks[type];

  return (
    <div className={cn("animate-in fade-in-0 duration-300", className)}>
      <FallbackComponent />
    </div>
  );
};

// CSS для анимации shimmer (добавить в globals.css)
export const shimmerCSS = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;