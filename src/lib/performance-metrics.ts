export interface ResourceMetric {
  name: string;
  type: 'script' | 'stylesheet' | 'image' | 'fetch' | 'xmlhttprequest' | 'other';
  size: number;
  duration: number;
  startTime: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usage: number; // percentage
}

export interface PageLoadMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  total: number;
}

export class CustomPerformanceMetrics {
  static measureResourceCount(): ResourceMetric[] {
    if (typeof window === 'undefined' || !window.performance) {
      return [];
    }

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.map(resource => ({
      name: resource.name,
      type: this.getResourceType(resource),
      size: resource.transferSize || 0,
      duration: resource.duration,
      startTime: resource.startTime
    }));
  }

  static measureMemoryUsage(): MemoryMetrics | null {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }

    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    
    if (!memory) {
      return null;
    }
    const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usage: Math.round(usage * 100) / 100
    };
  }

  static measurePageLoad(): PageLoadMetrics | null {
    if (typeof window === 'undefined' || !window.performance) {
      return null;
    }

    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) {
      return null;
    }

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      total: navigation.loadEventEnd - navigation.startTime
    };
  }

  private static getResourceType(resource: PerformanceResourceTiming): ResourceMetric['type'] {
    const name = resource.name.toLowerCase();
    
    if (name.includes('.js') || name.includes('javascript')) return 'script';
    if (name.includes('.css') || name.includes('stylesheet')) return 'stylesheet';
    if (name.includes('.jpg') || name.includes('.png') || name.includes('.gif') || 
        name.includes('.webp') || name.includes('.svg') || name.includes('.ico')) return 'image';
    if (resource.initiatorType === 'fetch') return 'fetch';
    if (resource.initiatorType === 'xmlhttprequest') return 'xmlhttprequest';
    
    return 'other';
  }

  private static getFirstPaint(): number {
    const paintEntries = window.performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private static getFirstContentfulPaint(): number {
    const paintEntries = window.performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }
}