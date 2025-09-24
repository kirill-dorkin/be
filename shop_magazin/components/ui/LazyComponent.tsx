"use client";

import { Suspense, lazy, ComponentType } from "react";
import { cn } from "@/lib/utils";

interface LazyComponentProps {
  fallback?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const DefaultFallback = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center p-4", className)}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

export function LazyComponent({ 
  fallback = <DefaultFallback />, 
  className,
  children 
}: LazyComponentProps) {
  return (
    <Suspense fallback={fallback}>
      <div className={className}>
        {children}
      </div>
    </Suspense>
  );
}

// HOC для создания lazy компонентов
export function withLazy<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyWrappedComponent = lazy(importFunc);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyWrappedComponent {...props} />
      </Suspense>
    );
  };
}

export default LazyComponent;