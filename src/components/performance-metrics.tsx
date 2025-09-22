'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Eye, 
  Clock, 
  Gauge, 
  TrendingUp,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: {
    good: number;
    poor: number;
  };
  unit: string;
  description: string;
}

interface PerformanceData {
  timestamp: number;
  metrics: {
    lcp: number;
    inp: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  navigation: {
    type: string;
    redirectCount: number;
    timing: {
      domContentLoaded: number;
      loadComplete: number;
      firstPaint: number;
    };
  };
  resources: {
    totalSize: number;
    jsSize: number;
    cssSize: number;
    imageSize: number;
    requestCount: number;
  };
}

const METRIC_CONFIGS: Record<string, PerformanceMetric> = {
  lcp: {
    name: 'Largest Contentful Paint',
    value: 0,
    rating: 'good',
    threshold: { good: 2500, poor: 4000 },
    unit: 'ms',
    description: 'Time until the largest content element is rendered'
  },

  cls: {
    name: 'Cumulative Layout Shift',
    value: 0,
    rating: 'good',
    threshold: { good: 0.1, poor: 0.25 },
    unit: '',
    description: 'Visual stability of the page during loading'
  },
  fcp: {
    name: 'First Contentful Paint',
    value: 0,
    rating: 'good',
    threshold: { good: 1800, poor: 3000 },
    unit: 'ms',
    description: 'Time until first content is painted'
  },
  ttfb: {
    name: 'Time to First Byte',
    value: 0,
    rating: 'good',
    threshold: { good: 800, poor: 1800 },
    unit: 'ms',
    description: 'Time until first byte is received from server'
  },
  inp: {
    name: 'Interaction to Next Paint',
    value: 0,
    rating: 'good',
    threshold: { good: 200, poor: 500 },
    unit: 'ms',
    description: 'Responsiveness of page to user interactions'
  }
};

const getRating = (value: number, threshold: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' => {
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'good': return 'text-green-600 bg-green-50 border-green-200';
    case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'poor': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getRatingIcon = (rating: string) => {
  switch (rating) {
    case 'good': return <CheckCircle className="w-4 h-4" />;
    case 'needs-improvement': return <AlertTriangle className="w-4 h-4" />;
    case 'poor': return <AlertTriangle className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
};

const formatValue = (value: number, unit: string) => {
  if (unit === 'ms') {
    return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(2)}s`;
  }
  if (unit === '') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}${unit}`;
};

export function PerformanceMetrics() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [history, setHistory] = useState<PerformanceData[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const collectMetrics = useCallback(async () => {
    if (typeof window === 'undefined') return;

    setIsCollecting(true);

    try {
      // Собираем метрики производительности
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource');

      // Вычисляем размеры ресурсов
      const resourceSizes = resources.reduce((acc, resource) => {
        const size = (resource as any).transferSize || 0;
        const type = resource.name.split('.').pop()?.toLowerCase() || '';
        
        acc.totalSize += size;
        acc.requestCount++;
        
        if (['js', 'mjs'].includes(type)) acc.jsSize += size;
        else if (type === 'css') acc.cssSize += size;
        else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type)) acc.imageSize += size;
        
        return acc;
      }, { totalSize: 0, jsSize: 0, cssSize: 0, imageSize: 0, requestCount: 0 });

      const data: PerformanceData = {
        timestamp: Date.now(),
        metrics: {
          lcp: 0, // Будет обновлено через PerformanceObserver
          inp: 0, // Будет обновлено через PerformanceObserver
          cls: 0, // Будет обновлено через PerformanceObserver
          fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          ttfb: navigation?.responseStart - navigation?.requestStart || 0
        },
        navigation: {
          type: (navigation as any)?.type || 'unknown',
          redirectCount: navigation?.redirectCount || 0,
          timing: {
            domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
            loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0
          }
        },
        resources: resourceSizes
      };

      // Получаем актуальные Web Vitals из глобального монитора
      if ((window as any).__performanceMonitor) {
        const currentMetrics = (window as any).__performanceMonitor.getMetrics();
        if (currentMetrics.length > 0) {
          const latest = currentMetrics[currentMetrics.length - 1];
          data.metrics.lcp = latest.lcp || data.metrics.lcp;
          data.metrics.inp = latest.inp || data.metrics.inp;
          data.metrics.cls = latest.cls || data.metrics.cls;
        }
      }

      setPerformanceData(data);
      setHistory(prev => [...prev.slice(-19), data]); // Храним последние 20 записей
    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
    } finally {
      setIsCollecting(false);
    }
  }, []);

  useEffect(() => {
    collectMetrics();
  }, [collectMetrics]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(collectMetrics, 5000); // Обновляем каждые 5 секунд
    return () => clearInterval(interval);
  }, [autoRefresh, collectMetrics]);

  const exportData = () => {
    if (!performanceData) return;

    const dataStr = JSON.stringify({
      current: performanceData,
      history: history
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!performanceData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">Collecting performance metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallScore = Object.entries(performanceData.metrics).reduce((score, [key, value]) => {
    const config = METRIC_CONFIGS[key];
    if (!config) return score;
    
    const rating = getRating(value, config.threshold);
    const points = rating === 'good' ? 100 : rating === 'needs-improvement' ? 50 : 0;
    return score + points;
  }, 0) / Object.keys(performanceData.metrics).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Metrics</h2>
          <p className="text-gray-600">Real-time Web Vitals and performance monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={collectMetrics} disabled={isCollecting}>
            <Activity className={`w-4 h-4 mr-2 ${isCollecting ? 'animate-pulse' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={overallScore} className="h-3" />
            </div>
            <div className="text-2xl font-bold">
              {Math.round(overallScore)}
            </div>
            <Badge className={getRatingColor(overallScore >= 80 ? 'good' : overallScore >= 50 ? 'needs-improvement' : 'poor')}>
              {overallScore >= 80 ? 'Good' : overallScore >= 50 ? 'Needs Improvement' : 'Poor'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(performanceData.metrics).map(([key, value]) => {
              const config = METRIC_CONFIGS[key];
              if (!config) return null;

              const rating = getRating(value, config.threshold);
              
              return (
                <Card key={key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {getRatingIcon(rating)}
                      {config.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {config.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {formatValue(value, config.unit)}
                        </span>
                        <Badge className={getRatingColor(rating)}>
                          {rating.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Good: &lt;{formatValue(config.threshold.good, config.unit)} • 
                        Poor: &gt;{formatValue(config.threshold.poor, config.unit)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Navigation Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>DOM Content Loaded:</span>
                  <span className="font-mono">{formatValue(performanceData.navigation.timing.domContentLoaded, 'ms')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Load Complete:</span>
                  <span className="font-mono">{formatValue(performanceData.navigation.timing.loadComplete, 'ms')}</span>
                </div>
                <div className="flex justify-between">
                  <span>First Paint:</span>
                  <span className="font-mono">{formatValue(performanceData.navigation.timing.firstPaint, 'ms')}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Navigation Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Navigation Type:</span>
                  <Badge variant="outline">{performanceData.navigation.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Redirect Count:</span>
                  <span className="font-mono">{performanceData.navigation.redirectCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span className="font-mono text-xs">
                    {new Date(performanceData.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Resource Sizes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Size:</span>
                  <span className="font-mono">{(performanceData.resources.totalSize / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span>JavaScript:</span>
                  <span className="font-mono">{(performanceData.resources.jsSize / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span>CSS:</span>
                  <span className="font-mono">{(performanceData.resources.cssSize / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Images:</span>
                  <span className="font-mono">{(performanceData.resources.imageSize / 1024).toFixed(1)} KB</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Request Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Requests:</span>
                  <span className="font-mono">{performanceData.resources.requestCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Size per Request:</span>
                  <span className="font-mono">
                    {performanceData.resources.requestCount > 0 
                      ? (performanceData.resources.totalSize / performanceData.resources.requestCount / 1024).toFixed(1) 
                      : '0'} KB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>History Records:</span>
                  <span className="font-mono">{history.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}