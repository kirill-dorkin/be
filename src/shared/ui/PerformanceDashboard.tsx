'use client';

import React, { useState, useEffect } from 'react';
import { CustomPerformanceMetrics, type ResourceMetric } from '@/lib/performance-metrics';
import { useWebVitals } from '@/shared/lib/useWebVitals';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  rating?: 'good' | 'needs-improvement' | 'poor';
  description?: string;
}

function MetricCard({ title, value, unit = '', rating, description }: MetricCardProps) {
  const getRatingColor = (rating?: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getRatingColor(rating)}`}>
      <div className="text-xs font-medium text-gray-700 mb-1">{title}</div>
      <div className="text-lg font-bold">
        {typeof value === 'number' ? Math.round(value * 100) / 100 : value}
        {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
      </div>
      {description && <div className="text-xs text-gray-600 mt-1">{description}</div>}
    </div>
  );
}

interface PerformanceDashboardProps {
  className?: string;
}

export default function PerformanceDashboard({ className = '' }: PerformanceDashboardProps) {
  const [pageLoadMetrics, setPageLoadMetrics] = useState<ReturnType<typeof CustomPerformanceMetrics.measurePageLoad> | null>(null);
  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetric[]>([]);
  const [memoryMetrics, setMemoryMetrics] = useState<ReturnType<typeof CustomPerformanceMetrics.measureMemoryUsage> | null>(null);
  
  const { metrics: webVitals, summary, isLoading } = useWebVitals();

  useEffect(() => {
    // Измерение метрик страницы
    const pageLoad = CustomPerformanceMetrics.measurePageLoad();
    const resources = CustomPerformanceMetrics.measureResourceCount();
    const memory = CustomPerformanceMetrics.measureMemoryUsage();

    setPageLoadMetrics(pageLoad);
    setResourceMetrics(resources);
    setMemoryMetrics(memory);

    // Обновление метрик каждые 5 секунд
    const interval = setInterval(() => {
      const newMemory = CustomPerformanceMetrics.measureMemoryUsage();
      setMemoryMetrics(newMemory);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${className}`}>
        <div className="text-sm text-gray-600">Loading performance metrics...</div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Performance Monitor</h2>
        <div className="text-xs text-gray-500">Real-time</div>
      </div>

      <div className="space-y-4">
        {/* Core Web Vitals */}
        <div>
          <h3 className="font-semibold mb-3 text-sm text-gray-700">Core Web Vitals</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(webVitals).map(([key, metric]) => {
              const typedMetric = metric as { label: string; value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor' };
              return (
                <MetricCard
                  key={key}
                  title={typedMetric.label}
                  value={typedMetric.value}
                  unit={typedMetric.unit}
                  rating={typedMetric.rating}
                />
              );
            })}
          </div>
        </div>

        {/* Page Load Metrics */}
        {pageLoadMetrics && (
          <div>
            <h3 className="font-semibold mb-3 text-sm text-gray-700">Page Load</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>DOM Ready:</span>
                <span className="font-mono">{Math.round(pageLoadMetrics.domContentLoaded)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Load Complete:</span>
                <span className="font-mono">{Math.round(pageLoadMetrics.loadComplete)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>First Paint:</span>
                <span className="font-mono">{Math.round(pageLoadMetrics.firstPaint)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-mono font-bold">{Math.round(pageLoadMetrics.loadComplete)}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Memory Usage */}
        {memoryMetrics && (
          <div>
            <h3 className="font-semibold mb-3 text-sm text-gray-700">Memory Usage</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Used:</span>
                <span className="font-mono">{(memoryMetrics.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Total:</span>
                <span className="font-mono">{(memoryMetrics.totalJSHeapSize / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${memoryMetrics.usagePercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-center text-gray-600">{memoryMetrics.usagePercentage.toFixed(1)}% used</div>
            </div>
          </div>
        )}

        {/* Resource Count */}
        {resourceMetrics.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-sm text-gray-700">Resources Loaded</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Scripts:</span>
                <span className="font-mono">{resourceMetrics.filter((r: ResourceMetric) => r.type === 'script').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Stylesheets:</span>
                <span className="font-mono">{resourceMetrics.filter((r: ResourceMetric) => r.type === 'stylesheet').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Images:</span>
                <span className="font-mono">{resourceMetrics.filter((r: ResourceMetric) => r.type === 'image').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-mono font-bold">{resourceMetrics.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Summary */}
        <div>
          <h3 className="font-semibold mb-3 text-sm text-gray-700">Metrics Summary</h3>
          <div className="text-center">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-green-600">
                <div className="font-bold">{summary.good}</div>
                <div>Good</div>
              </div>
              <div className="text-yellow-600">
                <div className="font-bold">{summary.needsImprovement}</div>
                <div>Needs Work</div>
              </div>
              <div className="text-red-600">
                <div className="font-bold">{summary.poor}</div>
                <div>Poor</div>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Total: {summary.total} metrics
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}