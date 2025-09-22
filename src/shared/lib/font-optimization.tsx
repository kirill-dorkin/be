'use client';

import { useState } from 'react';

// Типы для font loading
export type FontLoadingState = 'loading' | 'loaded' | 'error';

export interface FontMetrics {
  name: string;
  loadTime: number;
  status: FontLoadingState;
}

export interface FontLoadingOptions {
  timeout?: number;
  enableMetrics?: boolean;
}

// Упрощенный хук для управления загрузкой шрифтов (заглушка)
export function useFontLoader(options: FontLoadingOptions = {}) {
  const [fontState] = useState<{
    [key: string]: FontLoadingState;
  }>({
    system: 'loaded',
  });

  const [metrics] = useState<FontMetrics[]>([]);

  return {
    fontState,
    metrics,
    isLoading: false,
    hasErrors: false,
  };
}

// Заглушки для остальных функций
export const fontOptimizationUtils = {
  preloadCriticalFonts: () => {},
  supportsFontDisplay: () => true,
};

export const FontPreloader = () => null;

export const CriticalTextFallback = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={className}>{children}</div>;
};

export const optimizeFontLoading = () => {};

export const useOptimizedFonts = () => ({
  fontVariables: '',
  isLoading: false,
  hasErrors: false,
  criticalFontsLoaded: true,
  shouldShowFallback: false,
});

export default {
  useFontLoader,
  useOptimizedFonts,
  FontPreloader,
  CriticalTextFallback,
  fontOptimizationUtils,
  optimizeFontLoading,
};