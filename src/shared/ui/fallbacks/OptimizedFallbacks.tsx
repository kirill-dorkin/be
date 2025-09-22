import React from "react";
import { cn } from "@/shared/lib/utils";

// Базовый скелетон с анимацией
const SkeletonBase: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <div 
    className={cn(
      "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
      className
    )}
    style={style}
  />
);

// Fallback для таблиц
export const TableFallback: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
    {/* Заголовок таблицы */}
    <div className="flex items-center justify-between">
      <SkeletonBase className="h-6 w-32 rounded" />
      <SkeletonBase className="h-8 w-24 rounded" />
    </div>
    
    {/* Заголовки колонок */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonBase key={i} className="h-4 rounded" />
      ))}
    </div>
    
    {/* Строки данных */}
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonBase 
              key={colIndex} 
              className={cn(
                "h-4 rounded",
                colIndex === 0 && "w-3/4", // Первая колонка короче
                colIndex === columns - 1 && "w-1/2" // Последняя колонка короче
              )}
            />
          ))}
        </div>
      ))}
    </div>
    
    {/* Пагинация */}
    <div className="flex items-center justify-between pt-4 border-t">
      <SkeletonBase className="h-4 w-24 rounded" />
      <div className="flex gap-2">
        <SkeletonBase className="h-8 w-8 rounded" />
        <SkeletonBase className="h-8 w-8 rounded" />
        <SkeletonBase className="h-8 w-8 rounded" />
      </div>
    </div>
  </div>
);

// Fallback для карточек
export const CardFallback: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <div className="grid gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <SkeletonBase className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <SkeletonBase className="h-4 w-1/3 rounded" />
            <SkeletonBase className="h-3 w-1/2 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <SkeletonBase className="h-4 w-full rounded" />
          <SkeletonBase className="h-4 w-4/5 rounded" />
          <SkeletonBase className="h-4 w-3/5 rounded" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <SkeletonBase className="h-6 w-16 rounded-full" />
          <SkeletonBase className="h-8 w-20 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// Fallback для списков
export const ListFallback: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="bg-white rounded-lg shadow-sm border divide-y">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="p-4 flex items-center gap-3">
        <SkeletonBase className="h-8 w-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-1/3 rounded" />
          <SkeletonBase className="h-3 w-1/2 rounded" />
        </div>
        <SkeletonBase className="h-6 w-12 rounded" />
      </div>
    ))}
  </div>
);

// Fallback для дашборда
export const DashboardFallback: React.FC = () => (
  <div className="space-y-6">
    {/* Заголовок */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonBase className="h-8 w-48 rounded" />
        <SkeletonBase className="h-4 w-32 rounded" />
      </div>
      <SkeletonBase className="h-10 w-32 rounded" />
    </div>
    
    {/* Метрики */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border p-6 space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonBase className="h-4 w-20 rounded" />
            <SkeletonBase className="h-6 w-6 rounded" />
          </div>
          <SkeletonBase className="h-8 w-16 rounded" />
          <SkeletonBase className="h-3 w-24 rounded" />
        </div>
      ))}
    </div>
    
    {/* Основной контент */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TableFallback rows={6} columns={5} />
      </div>
      <div>
        <ListFallback items={8} />
      </div>
    </div>
  </div>
);

// Fallback для форм
export const FormFallback: React.FC<{ fields?: number }> = ({ fields = 5 }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
    <div className="space-y-2">
      <SkeletonBase className="h-6 w-32 rounded" />
      <SkeletonBase className="h-4 w-48 rounded" />
    </div>
    
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <SkeletonBase className="h-4 w-24 rounded" />
          <SkeletonBase className="h-10 w-full rounded border" />
        </div>
      ))}
    </div>
    
    <div className="flex gap-3 pt-4">
      <SkeletonBase className="h-10 w-24 rounded" />
      <SkeletonBase className="h-10 w-20 rounded" />
    </div>
  </div>
);

// Fallback для графиков
export const ChartFallback: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
    <div className="flex items-center justify-between">
      <SkeletonBase className="h-6 w-32 rounded" />
      <SkeletonBase className="h-8 w-24 rounded" />
    </div>
    
    <div className="h-64 flex items-end justify-between gap-2">
      {Array.from({ length: 12 }).map((_, index) => (
        <SkeletonBase 
          key={index} 
          className="w-full rounded-t"
          style={{ height: `${Math.random() * 80 + 20}%` }}
        />
      ))}
    </div>
    
    <div className="flex justify-center gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <SkeletonBase className="h-3 w-3 rounded-full" />
          <SkeletonBase className="h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// Универсальный fallback с выбором типа
export const UniversalFallback: React.FC<{
  type: "table" | "card" | "list" | "dashboard" | "form" | "chart";
  props?: any;
}> = ({ type, props = {} }) => {
  switch (type) {
    case "table":
      return <TableFallback {...props} />;
    case "card":
      return <CardFallback {...props} />;
    case "list":
      return <ListFallback {...props} />;
    case "dashboard":
      return <DashboardFallback {...props} />;
    case "form":
      return <FormFallback {...props} />;
    case "chart":
      return <ChartFallback {...props} />;
    default:
      return <CardFallback {...props} />;
  }
};