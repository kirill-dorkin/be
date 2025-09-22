import { memo } from "react";
import { cn } from "@/shared/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "table" | "card" | "list" | "dashboard";
  rows?: number;
}

const LoadingSkeleton = memo(({ 
  className = "", 
  variant = "card",
  rows = 3 
}: LoadingSkeletonProps) => {
  const baseClasses = "bg-background shadow rounded-lg animate-pulse";
  
  const variants = {
    table: (
      <div className={cn(baseClasses, "p-6", className)}>
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    ),
    card: (
      <div className={cn(baseClasses, "p-6", className)}>
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    ),
    list: (
      <div className={cn(baseClasses, "p-4", className)}>
        <div className="h-5 bg-gray-200 rounded mb-3 w-1/4"></div>
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    dashboard: (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn(baseClasses, "p-4")}>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-2 h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  };

  return variants[variant];
});

LoadingSkeleton.displayName = "LoadingSkeleton";

export default LoadingSkeleton;