'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface RouteAnalytics {
  path: string;
  visits: number;
  averageTime: number;
  bounceRate: number;
  conversionRate: number;
  lastVisited: Date;
  userAgent: string;
  referrer: string;
}

interface PrefetchStrategy {
  type: 'immediate' | 'hover' | 'viewport' | 'idle' | 'predictive';
  priority: 'high' | 'medium' | 'low';
  conditions?: {
    userBehavior?: 'engaged' | 'browsing' | 'searching';
    connectionType?: 'fast' | 'slow' | 'offline';
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
}

interface RouteConfig {
  path: string;
  prefetchStrategy: PrefetchStrategy;
  cacheStrategy: 'static' | 'dynamic' | 'hybrid';
  preloadResources?: string[];
  criticalCSS?: string;
  analytics?: boolean;
}

interface NavigationMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  fromPath: string;
  toPath: string;
  method: 'link' | 'programmatic' | 'browser';
  cacheHit: boolean;
}

class AdvancedRouteManager {
  private routes: Map<string, RouteConfig> = new Map();
  private analytics: Map<string, RouteAnalytics> = new Map();
  private prefetchCache: Map<string, Promise<void>> = new Map();
  private navigationMetrics: NavigationMetrics[] = [];
  private observers: Set<(analytics: Map<string, RouteAnalytics>) => void> = new Set();
  private currentNavigation: NavigationMetrics | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAnalytics();
      this.setupNavigationTracking();
    }
  }

  private initializeAnalytics(): void {
    // Load analytics from localStorage
    const stored = localStorage.getItem('route-analytics');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([path, analytics]) => {
          this.analytics.set(path, {
            ...(analytics as RouteAnalytics),
            lastVisited: new Date((analytics as RouteAnalytics).lastVisited),
          });
        });
      } catch (error) {
        console.warn('Failed to load route analytics:', error);
      }
    }
  }

  private setupNavigationTracking(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.currentNavigation) {
        this.endNavigation();
      }
    });

    // Track beforeunload
    window.addEventListener('beforeunload', () => {
      this.saveAnalytics();
    });
  }

  registerRoute(config: RouteConfig): void {
    this.routes.set(config.path, config);
  }

  startNavigation(fromPath: string, toPath: string, method: 'link' | 'programmatic' | 'browser' = 'link'): void {
    this.currentNavigation = {
      startTime: performance.now(),
      fromPath,
      toPath,
      method,
      cacheHit: this.prefetchCache.has(toPath),
    };
  }

  endNavigation(): void {
    if (!this.currentNavigation) return;

    const endTime = performance.now();
    const duration = endTime - this.currentNavigation.startTime;

    const completedNavigation: NavigationMetrics = {
      ...this.currentNavigation,
      endTime,
      duration,
    };

    this.navigationMetrics.push(completedNavigation);
    this.updateAnalytics(completedNavigation);
    this.currentNavigation = null;
  }

  private updateAnalytics(navigation: NavigationMetrics): void {
    const existing = this.analytics.get(navigation.toPath) || {
      path: navigation.toPath,
      visits: 0,
      averageTime: 0,
      bounceRate: 0,
      conversionRate: 0,
      lastVisited: new Date(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    };

    const newVisits = existing.visits + 1;
    const newAverageTime = (existing.averageTime * existing.visits + (navigation.duration || 0)) / newVisits;

    this.analytics.set(navigation.toPath, {
      ...existing,
      visits: newVisits,
      averageTime: newAverageTime,
      lastVisited: new Date(),
    });

    this.notifyObservers();
    this.saveAnalytics();
  }

  private saveAnalytics(): void {
    try {
      const data = Object.fromEntries(this.analytics);
      localStorage.setItem('route-analytics', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save route analytics:', error);
    }
  }

  async prefetchRoute(path: string, strategy: PrefetchStrategy): Promise<void> {
    if (this.prefetchCache.has(path)) {
      return this.prefetchCache.get(path);
    }

    const prefetchPromise = this.executePrefetch(path, strategy);
    this.prefetchCache.set(path, prefetchPromise);

    try {
      await prefetchPromise;
    } catch (error) {
      console.warn(`Failed to prefetch ${path}:`, error);
      this.prefetchCache.delete(path);
    }
  }

  private async executePrefetch(path: string, strategy: PrefetchStrategy): Promise<void> {
    // Check conditions
    if (strategy.conditions && !this.checkConditions(strategy.conditions)) {
      return;
    }

    // Use Next.js router prefetch if available
    if (typeof window !== 'undefined') {
      const nextRouter = (window as { next?: { router?: { prefetch?: (path: string) => Promise<void> } } }).next?.router;
      if (nextRouter?.prefetch) {
        await nextRouter.prefetch(path);
        return;
      }
    }

    // Fallback prefetch implementation
    return this.fallbackPrefetch(path);
  }

  private checkConditions(conditions: NonNullable<PrefetchStrategy['conditions']>): boolean {
    // Check connection type
    if (conditions.connectionType) {
      const connection = (navigator as { connection?: { effectiveType?: string } }).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        const isFast = effectiveType === '4g' || effectiveType === '3g';
        const isSlow = effectiveType === '2g' || effectiveType === 'slow-2g';
        
        if (conditions.connectionType === 'fast' && !isFast) return false;
        if (conditions.connectionType === 'slow' && !isSlow) return false;
      }
    }

    // Check device type
    if (conditions.deviceType) {
      const userAgent = navigator.userAgent;
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
      const isTablet = /iPad|Tablet/.test(userAgent);
      
      if (conditions.deviceType === 'mobile' && !isMobile) return false;
      if (conditions.deviceType === 'tablet' && !isTablet) return false;
      if (conditions.deviceType === 'desktop' && (isMobile || isTablet)) return false;
    }

    // Check time of day
    if (conditions.timeOfDay) {
      const hour = new Date().getHours();
      const timeOfDay = 
        hour < 6 ? 'night' :
        hour < 12 ? 'morning' :
        hour < 18 ? 'afternoon' : 'evening';
      
      if (conditions.timeOfDay !== timeOfDay) return false;
    }

    return true;
  }

  private async fallbackPrefetch(path: string): Promise<void> {
    // Create link element for prefetching
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    
    return new Promise((resolve, reject) => {
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to prefetch ${path}`));
      document.head.appendChild(link);
      
      // Cleanup after 5 seconds
      setTimeout(() => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      }, 5000);
    });
  }

  getAnalytics(): Map<string, RouteAnalytics> {
    return new Map(this.analytics);
  }

  getNavigationMetrics(): NavigationMetrics[] {
    return [...this.navigationMetrics];
  }

  subscribe(observer: (analytics: Map<string, RouteAnalytics>) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.analytics));
  }

  getPredictiveRoutes(currentPath: string, limit: number = 3): string[] {
    const analytics = Array.from(this.analytics.values())
      .filter(a => a.path !== currentPath)
      .sort((a, b) => {
        // Score based on visits, recency, and conversion rate
        const scoreA = a.visits * 0.4 + (1 / (Date.now() - a.lastVisited.getTime())) * 0.3 + a.conversionRate * 0.3;
        const scoreB = b.visits * 0.4 + (1 / (Date.now() - b.lastVisited.getTime())) * 0.3 + b.conversionRate * 0.3;
        return scoreB - scoreA;
      })
      .slice(0, limit)
      .map(a => a.path);

    return analytics;
  }
}

// Global manager instance
const globalRouteManager = new AdvancedRouteManager();

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  prefetchStrategy?: PrefetchStrategy;
  className?: string;
  onClick?: () => void;
  trackAnalytics?: boolean;
}

export const SmartLink: React.FC<SmartLinkProps> = ({
  href,
  children,
  prefetchStrategy = { type: 'hover', priority: 'medium' },
  className,
  onClick,
  trackAnalytics = true,
}) => {
  const pathname = usePathname();
  const [isPrefetched, setIsPrefetched] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const handlePrefetch = useCallback(async () => {
    if (isPrefetched) return;
    
    try {
      await globalRouteManager.prefetchRoute(href, prefetchStrategy);
      setIsPrefetched(true);
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }, [href, prefetchStrategy, isPrefetched]);

  const handleClick = useCallback(() => {
    if (trackAnalytics && pathname) {
      globalRouteManager.startNavigation(pathname, href, 'link');
    }
    onClick?.();
  }, [href, pathname, onClick, trackAnalytics]);

  const handleMouseEnter = useCallback(() => {
    if (prefetchStrategy.type === 'hover') {
      hoverTimeoutRef.current = setTimeout(handlePrefetch, 100);
    }
  }, [prefetchStrategy.type, handlePrefetch]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  }, []);

  // Viewport-based prefetching
  useEffect(() => {
    if (prefetchStrategy.type !== 'viewport' || !linkRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handlePrefetch();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(linkRef.current);
    return () => observer.disconnect();
  }, [prefetchStrategy.type, handlePrefetch]);

  // Immediate prefetching
  useEffect(() => {
    if (prefetchStrategy.type === 'immediate') {
      handlePrefetch();
    }
  }, [prefetchStrategy.type, handlePrefetch]);

  // Idle prefetching
  useEffect(() => {
    if (prefetchStrategy.type !== 'idle') return;

    const idleCallback = () => {
      handlePrefetch();
    };

    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(idleCallback);
      return () => cancelIdleCallback(id);
    } else {
      const timeout = setTimeout(idleCallback, 100);
      return () => clearTimeout(timeout);
    }
  }, [prefetchStrategy.type, handlePrefetch]);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Link>
  );
};

interface PredictivePrefetchProps {
  currentPath: string;
  maxPredictions?: number;
  strategy?: PrefetchStrategy;
}

export const PredictivePrefetch: React.FC<PredictivePrefetchProps> = ({
  currentPath,
  maxPredictions = 3,
  strategy = { type: 'idle', priority: 'low' },
}) => {
  useEffect(() => {
    const routes = globalRouteManager.getPredictiveRoutes(currentPath, maxPredictions);

    // Prefetch predicted routes
    routes.forEach(route => {
      globalRouteManager.prefetchRoute(route, strategy);
    });
  }, [currentPath, maxPredictions, strategy]);

  return null; // This component doesn't render anything
};

interface RouteAnalyticsDisplayProps {
  className?: string;
}

export const RouteAnalyticsDisplay: React.FC<RouteAnalyticsDisplayProps> = ({
  className = '',
}) => {
  const [analytics, setAnalytics] = useState<Map<string, RouteAnalytics>>(new Map());

  useEffect(() => {
    const unsubscribe = globalRouteManager.subscribe(setAnalytics);
    setAnalytics(globalRouteManager.getAnalytics());
    return unsubscribe;
  }, []);

  const sortedAnalytics = useMemo(() => {
    return Array.from(analytics.values())
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  }, [analytics]);

  const totalVisits = useMemo(() => {
    return Array.from(analytics.values()).reduce((sum, a) => sum + a.visits, 0);
  }, [analytics]);

  const averageTime = useMemo(() => {
    const times = Array.from(analytics.values()).map(a => a.averageTime);
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  }, [analytics]);

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Route Analytics</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{analytics.size}</div>
          <div className="text-sm text-gray-600">Unique Routes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalVisits}</div>
          <div className="text-sm text-gray-600">Total Visits</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{averageTime.toFixed(0)}ms</div>
          <div className="text-sm text-gray-600">Avg Load Time</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Top Routes</h4>
        {sortedAnalytics.map((route) => (
          <div key={route.path} className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="flex-1">
              <div className="font-medium text-sm">{route.path}</div>
              <div className="text-xs text-gray-500">
                Last visited: {route.lastVisited.toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{route.visits} visits</div>
              <div className="text-xs text-gray-500">{route.averageTime.toFixed(0)}ms avg</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const useRouteAnalytics = () => {
  const [analytics, setAnalytics] = useState<Map<string, RouteAnalytics>>(new Map());
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = globalRouteManager.subscribe(setAnalytics);
    setAnalytics(globalRouteManager.getAnalytics());
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Track navigation end when pathname changes
    globalRouteManager.endNavigation();
  }, [pathname]);

  return {
    analytics,
    navigationMetrics: globalRouteManager.getNavigationMetrics(),
    manager: globalRouteManager,
  };
};

export const useSmartPrefetch = (routes: string[], strategy: PrefetchStrategy = { type: 'idle', priority: 'low' }) => {
  useEffect(() => {
    routes.forEach(route => {
      globalRouteManager.prefetchRoute(route, strategy);
    });
  }, [routes, strategy]);
};

export default {
  SmartLink,
  PredictivePrefetch,
  RouteAnalyticsDisplay,
  useRouteAnalytics,
  useSmartPrefetch,
  AdvancedRouteManager,
};