"use client";

import { useEffect, useCallback } from "react";

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
}

export function usePerformance() {
  // Измерение Web Vitals
  const measureWebVitals = useCallback(() => {
    if (typeof window === "undefined") return;

    const metrics: PerformanceMetrics = {};

    // Largest Contentful Paint (LCP)
    if ("PerformanceObserver" in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          metrics.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find((entry) => entry.name === "first-contentful-paint");
          if (fcpEntry) {
            metrics.fcp = fcpEntry.startTime;
          }
        });
        fcpObserver.observe({ type: "paint", buffered: true });

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value: number };
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
          metrics.cls = clsValue;
        });
        clsObserver.observe({ type: "layout-shift", buffered: true });

        // Time to First Byte (TTFB)
        const navigationEntries = performance.getEntriesByType("navigation");
        if (navigationEntries.length > 0) {
          const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
          metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
        }
      } catch (error) {
        console.warn("Performance measurement failed:", error);
      }
    }

    return metrics;
  }, []);

  // Предзагрузка критических ресурсов
  const preloadCriticalResources = useCallback(() => {
    if (typeof window === "undefined") return;

    // Предзагрузка шрифтов - используем Next.js локальные шрифты, предзагрузка не нужна
    const fontPreloads: string[] = [];

    fontPreloads.forEach((font) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = font;
      link.as = "font";
      link.type = "font/woff";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });

    // Предзагрузка критических изображений
    const criticalImages = [
      "/images/bulan-bali.jpg",
      "/images/laptop-store.jpg",
    ];

    criticalImages.forEach((image) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = image;
      link.as = "image";
      document.head.appendChild(link);
    });
  }, []);

  // Оптимизация изображений с lazy loading
  const optimizeImages = useCallback(() => {
    if (typeof window === "undefined") return;

    const images = document.querySelectorAll("img[data-src]");
    
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || "";
            img.classList.remove("lazy");
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    }
  }, []);

  // Очистка неиспользуемых ресурсов
  const cleanupResources = useCallback(() => {
    if (typeof window === "undefined") return;

    // Очистка старых prefetch ссылок
    const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
    prefetchLinks.forEach((link) => {
      if (link.getAttribute("data-timestamp")) {
        const timestamp = parseInt(link.getAttribute("data-timestamp") || "0");
        const now = Date.now();
        // Удаляем prefetch ссылки старше 5 минут
        if (now - timestamp > 300000) {
          link.remove();
        }
      }
    });
  }, []);

  // Инициализация при монтировании
  useEffect(() => {
    preloadCriticalResources();
    optimizeImages();
    measureWebVitals();
    
    // Периодическая очистка ресурсов
    const cleanupInterval = setInterval(cleanupResources, 60000); // каждую минуту

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [preloadCriticalResources, optimizeImages, measureWebVitals, cleanupResources]);

  return {
    measureWebVitals,
    preloadCriticalResources,
    optimizeImages,
    cleanupResources,
  };
}