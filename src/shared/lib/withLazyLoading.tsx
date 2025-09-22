import dynamic from "next/dynamic";
import { ComponentType, Suspense, ReactElement } from "react";
import { DynamicOptionsLoadingProps } from "next/dynamic";
import LoadingSkeleton from "@/shared/ui/LoadingSkeleton";

interface LazyLoadingOptions {
  variant?: "table" | "card" | "list" | "dashboard";
  rows?: number;
  ssr?: boolean;
  loading?: (loadingProps: DynamicOptionsLoadingProps) => JSX.Element | null;
  fallback?: ReactElement;
}

/**
 * HOC для оптимизированного lazy loading компонентов
 * Автоматически добавляет Suspense и оптимизированные fallback компоненты
 */
export function withLazyLoading<T extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: LazyLoadingOptions = {}
) {
  const {
    variant = "card",
    rows = 3,
    ssr = false,
    loading,
    fallback
  } = options;

  const defaultFallback = fallback || <LoadingSkeleton variant={variant} rows={rows} />;

  const LazyComponent = dynamic(importFn, {
    loading: loading || (() => defaultFallback),
    ssr
  });

  return function LazyLoadedComponent(props: T) {
    return (
      <Suspense fallback={defaultFallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Предустановленные конфигурации для часто используемых компонентов
 */
export const lazyLoadingPresets = {
  table: {
    variant: "table" as const,
    rows: 5,
    ssr: false
  },
  dashboard: {
    variant: "dashboard" as const,
    ssr: false
  },
  userList: {
    variant: "list" as const,
    rows: 4,
    ssr: false
  },
  card: {
    variant: "card" as const,
    rows: 3,
    ssr: false
  }
} as const;

/**
 * Утилита для создания lazy компонентов с предустановками или кастомным fallback
 */
export function createLazyComponent<T extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  presetOrFallback: keyof typeof lazyLoadingPresets | ReactElement
) {
  if (typeof presetOrFallback === 'string') {
    return withLazyLoading(importFn, lazyLoadingPresets[presetOrFallback]);
  } else {
    return withLazyLoading(importFn, { fallback: presetOrFallback });
  }
}