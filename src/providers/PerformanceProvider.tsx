"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
  inp?: number;
}

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  isLoading: boolean;
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
    // Инициализация Web Vitals
    if (typeof window !== "undefined") {
      // Предзагрузка критических ресурсов
      const preloadCriticalResources = () => {
        const criticalRoutes = ["/request", "/admin/dashboard", "/worker/my-tasks"];
        
        criticalRoutes.forEach(route => {
          const link = document.createElement("link");
          link.rel = "prefetch";
          link.href = route;
          document.head.appendChild(link);
        });
      };

      // Оптимизация шрифтов
      const optimizeFonts = () => {
        const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
        fontLinks.forEach(link => {
          (link as HTMLLinkElement).crossOrigin = "anonymous";
        });
      };

      // Инициализация после загрузки DOM
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          preloadCriticalResources();
          optimizeFonts();
          setIsLoading(false);
        });
      } else {
        preloadCriticalResources();
        optimizeFonts();
        setIsLoading(false);
      }

      // Очистка неиспользуемых ресурсов
      const cleanup = () => {
        const unusedPrefetchLinks = document.querySelectorAll('link[rel="prefetch"]:not([data-keep])');
        unusedPrefetchLinks.forEach(link => {
          if (Date.now() - parseInt(link.getAttribute("data-timestamp") || "0") > 300000) { // 5 минут
            link.remove();
          }
        });
      };

      const cleanupInterval = setInterval(cleanup, 60000); // Каждую минуту

      return () => {
        clearInterval(cleanupInterval);
      };
    }
  }, []);

  const value: PerformanceContextType = {
    metrics,
    isLoading,
    reportMetric
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}