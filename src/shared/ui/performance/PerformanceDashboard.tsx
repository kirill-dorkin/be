'use client';

import React, { useState, useEffect } from 'react';
import { PerformanceDisplay } from './PerformanceMonitor';
import ImageOptimizer from './ImageOptimizer';
import RouteOptimizer from './RouteOptimizer';
import { StreamingMetrics } from './StreamingSSR';

interface PerformanceDashboardProps {
  showDetails?: boolean;
  enableRealTimeMonitoring?: boolean;
  enableImageOptimization?: boolean;
  enableRouteOptimization?: boolean;
  enableStreamingSSR?: boolean;
}

interface OverallPerformanceMetrics {
  score: number;
  grade: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  webVitals: {
    lcp: number;
    inp: number;
    cls: number;
    ttfb: number;
    fcp: number;
  };
  imageMetrics: {
    totalImages: number;
    optimizedImages: number;
    averageLoadTime: number;
    bandwidthSaved: number;
  };
  routeMetrics: {
    averageNavigationTime: number;
    prefetchHitRate: number;
    cacheEfficiency: number;
  };
  streamingMetrics: {
    ttfb: number;
    streamingChunks: number;
    hydrationTime: number;
  };
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  showDetails = false,
  enableRealTimeMonitoring = true,
  enableImageOptimization = true,
  enableRouteOptimization = true,
  enableStreamingSSR = true
}) => {
  const [overallMetrics, setOverallMetrics] = useState<OverallPerformanceMetrics | null>(null);
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [activeTab, setActiveTab] = useState<'overview' | 'webvitals' | 'images' | 'routes' | 'streaming'>('overview');

  useEffect(() => {
    if (!enableRealTimeMonitoring) return;

    const updateMetrics = () => {
      // Собираем метрики из всех компонентов
      const webVitals = {
        lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
        inp: 0, // Будет обновлено через PerformanceObserver
        cls: 0, // Будет обновлено через PerformanceObserver
        ttfb: performance.getEntriesByType('navigation')[0]?.responseStart || 0,
        fcp: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0
      };

      // Вычисляем общий балл производительности
      const score = calculatePerformanceScore(webVitals);
      const grade = getPerformanceGrade(score);

      setOverallMetrics({
        score,
        grade,
        webVitals,
        imageMetrics: {
          totalImages: document.images.length,
          optimizedImages: Array.from(document.images).filter(img => 
            img.loading === 'lazy' || img.srcset
          ).length,
          averageLoadTime: 0,
          bandwidthSaved: 0
        },
        routeMetrics: {
          averageNavigationTime: 0,
          prefetchHitRate: 0,
          cacheEfficiency: 0
        },
        streamingMetrics: {
          ttfb: webVitals.ttfb,
          streamingChunks: 0,
          hydrationTime: 0
        }
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [enableRealTimeMonitoring]);

  const calculatePerformanceScore = (webVitals: {
    lcp: number;
    inp: number;
    cls: number;
    ttfb: number;
  }): number => {
    const lcpScore = webVitals.lcp <= 2500 ? 100 : webVitals.lcp <= 4000 ? 75 : 50;
    const ttfbScore = webVitals.ttfb <= 800 ? 100 : webVitals.ttfb <= 1800 ? 75 : 50;
    const clsScore = webVitals.cls <= 0.1 ? 100 : webVitals.cls <= 0.25 ? 75 : 50;
    
    return Math.round((lcpScore + ttfbScore + clsScore) / 3);
  };

  const getPerformanceGrade = (score: number): 'excellent' | 'good' | 'needs-improvement' | 'poor' => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'poor';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (time: number): string => {
    if (time < 1000) return `${Math.round(time)}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  if (!overallMetrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                overallMetrics.grade === 'excellent' ? 'bg-green-500' :
                overallMetrics.grade === 'good' ? 'bg-blue-500' :
                overallMetrics.grade === 'needs-improvement' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <h3 className="text-lg font-semibold">Performance Dashboard</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{overallMetrics.score}</span>
              <span className={`text-sm font-medium ${getGradeColor(overallMetrics.grade)}`}>
                {overallMetrics.grade.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">LCP</div>
            <div className="text-lg font-semibold">{formatTime(overallMetrics.webVitals.lcp)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">TTFB</div>
            <div className="text-lg font-semibold">{formatTime(overallMetrics.webVitals.ttfb)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">CLS</div>
            <div className="text-lg font-semibold">{overallMetrics.webVitals.cls.toFixed(3)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Images</div>
            <div className="text-lg font-semibold">
              {overallMetrics.imageMetrics.optimizedImages}/{overallMetrics.imageMetrics.totalImages}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed view */}
      {isExpanded && (
        <div className="p-4">
          {/* Tabs */}
          <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'webvitals', label: 'Web Vitals' },
              { id: 'images', label: 'Images' },
              { id: 'routes', label: 'Routes' },
              { id: 'streaming', label: 'Streaming' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'webvitals' | 'images' | 'routes' | 'streaming')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="space-y-4">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Performance Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Overall Score</span>
                      <span className="font-medium">{overallMetrics.score}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Grade</span>
                      <span className={`font-medium ${getGradeColor(overallMetrics.grade)}`}>
                        {overallMetrics.grade}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Optimization Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Image Optimization</span>
                      <span className={`text-sm ${enableImageOptimization ? 'text-green-600' : 'text-gray-400'}`}>
                        {enableImageOptimization ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Route Optimization</span>
                      <span className={`text-sm ${enableRouteOptimization ? 'text-green-600' : 'text-gray-400'}`}>
                        {enableRouteOptimization ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Streaming SSR</span>
                      <span className={`text-sm ${enableStreamingSSR ? 'text-green-600' : 'text-gray-400'}`}>
                        {enableStreamingSSR ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'webvitals' && enableRealTimeMonitoring && (
              <PerformanceDisplay showAlerts={true} />
            )}

            {activeTab === 'images' && enableImageOptimization && (
              <ImageOptimizer />
            )}

            {activeTab === 'routes' && enableRouteOptimization && (
              <RouteOptimizer />
            )}

            {activeTab === 'streaming' && enableStreamingSSR && (
              <StreamingMetrics showDetails={true} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;