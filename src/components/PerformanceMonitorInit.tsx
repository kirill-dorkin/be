"use client";

import { useEffect } from "react";

export function PerformanceMonitorInit() {
  useEffect(() => {
    // Инициализируем performance monitor только на клиенте
    if (typeof window !== "undefined") {
      // Импортируем и инициализируем performance monitor
      import("@/lib/performance-monitor-safe").then(({ getPerformanceMonitor }) => {
        getPerformanceMonitor().then((monitor) => {
          if (monitor && !monitor.isReady()) {
            monitor.init();
          }
        });
      });
    }
  }, []);

  return null; // Этот компонент не рендерит ничего
}