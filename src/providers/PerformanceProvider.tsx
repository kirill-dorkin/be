"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { performanceMonitor, getPerformanceMonitor } from "@/lib/performance-monitor-safe";

interface PerformanceMetrics {
  lcp?: number;
  inp?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
}

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  isLoading: boolean;
  monitor: typeof performanceMonitor;
  reportMetric: (name: string, value: number) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function usePerformanceContext() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformanceContext must be used within PerformanceProvider");
  }
  return context;
}

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isLoading, setIsLoading] = useState(true);

  const reportMetric = (name: string, value: number) => {
    setMetrics(prev => ({
      ...prev,
      [name.toLowerCase()]: value
    }));
  };

  useEffect(() => {
    // Простая инициализация без избыточной предзагрузки
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  const value: PerformanceContextType = {
    metrics,
    isLoading,
    monitor: performanceMonitor,
    reportMetric,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}