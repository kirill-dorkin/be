"use client";

import React, { memo, ReactNode } from "react";

interface MemoizedComponentProps {
  children: ReactNode;
  deps?: any[];
  className?: string;
}

// Компонент для мемоизации дочерних элементов
const MemoizedComponent = memo<MemoizedComponentProps>(
  ({ children, className }) => {
    return (
      <div className={className}>
        {children}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Кастомная функция сравнения
    if (prevProps.className !== nextProps.className) {
      return false;
    }
    
    if (prevProps.deps && nextProps.deps) {
      return prevProps.deps.every((dep, index) => 
        Object.is(dep, nextProps.deps![index])
      );
    }
    
    return true;
  }
);

MemoizedComponent.displayName = "MemoizedComponent";

// HOC для мемоизации компонентов
export function withMemo<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  const MemoizedWrappedComponent = memo(Component, areEqual);
  MemoizedWrappedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
  return MemoizedWrappedComponent;
}

// Хук для создания стабильных объектов
export function useStableObject<T extends Record<string, any>>(obj: T): T {
  return React.useMemo(() => obj, Object.values(obj));
}

// Хук для создания стабильных массивов
export function useStableArray<T>(arr: T[]): T[] {
  return React.useMemo(() => arr, arr);
}

export default MemoizedComponent;