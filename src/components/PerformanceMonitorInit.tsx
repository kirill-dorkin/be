"use client";

import { useEffect } from "react";

export function PerformanceMonitorInit() {
  useEffect(() => {
    // Инициализируем performance monitor только на клиенте
    if (typeof window !== "undefined") {
      // Импортируем и инициализируем performance monitor
      import("@/lib/performance-monitor").then(({ performanceMonitor }) => {
        if (performanceMonitor && !performanceMonitor.isReady()) {
          performanceMonitor.init();
        }
      });
    }
  }, []);

  return null; // Этот компонент не рендерит ничего
}