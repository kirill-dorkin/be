'use client';

export interface ResourceMetric {
  name: string;
  type: string;
  size: number;
  duration: number;
  startTime: number;
}

export interface PageLoadMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  navigationStart: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
}

export class CustomPerformanceMetrics {
  static measurePageLoad(): PageLoadMetrics | null {
    if (typeof window === 'undefined' || !window.performance) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');

    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0;
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      firstPaint,
      firstContentfulPaint,
      navigationStart: navigation.fetchStart,
    };
  }

  static measureResourceCount(): ResourceMetric[] {
    if (typeof window === 'undefined' || !window.performance) {
      return [];
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.map(resource => ({
      name: resource.name,
      type: resource.initiatorType,
      size: resource.transferSize || 0,
      duration: resource.responseEnd - resource.requestStart,
      startTime: resource.startTime,
    }));
  }

  static measureMemoryUsage(): MemoryMetrics | null {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }

  static measureNetworkTiming(): Record<string, number> | null {
    if (typeof window === 'undefined' || !window.performance) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ssl: navigation.secureConnectionStart > 0 ? navigation.connectEnd - navigation.secureConnectionStart : 0,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
    };
  }

  static measureRenderTiming(): Record<string, number> | null {
    if (typeof window === 'undefined' || !window.performance) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      domProcessing: navigation.domComplete - navigation.domContentLoadedEventStart,
      domInteractive: navigation.domInteractive - navigation.fetchStart,
      domComplete: navigation.domComplete - navigation.fetchStart,
      loadEvent: navigation.loadEventEnd - navigation.loadEventStart,
    };
  }

  static clearMetrics(): void {
    if (typeof window !== 'undefined' && window.performance && performance.clearResourceTimings) {
      performance.clearResourceTimings();
    }
  }

  static getPerformanceScore(): number {
    const pageLoad = this.measurePageLoad();
    const memory = this.measureMemoryUsage();
    
    if (!pageLoad) return 0;

    let score = 100;

    // Штрафы за медленную загрузку
    if (pageLoad.firstContentfulPaint > 3000) score -= 20;
    else if (pageLoad.firstContentfulPaint > 1800) score -= 10;

    if (pageLoad.domContentLoaded > 5000) score -= 20;
    else if (pageLoad.domContentLoaded > 3000) score -= 10;

    // Штрафы за использование памяти
    if (memory && memory.usagePercentage > 80) score -= 15;
    else if (memory && memory.usagePercentage > 60) score -= 5;

    return Math.max(0, score);
  }
}