'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PerformanceMetric, performanceMonitor } from '@/lib/performance-monitor';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
import { Activity, Clock, Zap, TrendingUp, RefreshCw } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | undefined;
  unit: string;
  threshold: { good: number; poor: number };
  icon: React.ReactNode;
  description: string;
}

const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fcp: { good: 1800, poor: 3000 },
  cls: { good: 0.1, poor: 0.25 },
  ttfb: { good: 800, poor: 1800 },
  inp: { good: 200, poor: 500 }
};

function MetricCard({ title, value, unit, threshold, icon, description }: MetricCardProps) {
  const getRating = (val: number | undefined) => {
    if (val === undefined) return 'unknown';
    if (val <= threshold.good) return 'good';
    if (val <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getBadgeVariant = (rating: string) => {
    switch (rating) {
      case 'good': return 'default';
      case 'needs-improvement': return 'secondary';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  const formatValue = (val: number | undefined) => {
    if (val === undefined) return 'N/A';
    if (unit === 'ms') return Math.round(val);
    if (unit === 's') return (val / 1000).toFixed(2);
    return val.toFixed(3);
  };

  const rating = getRating(value);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <Badge variant={getBadgeVariant(rating)}>
          {rating}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(value)} {unit}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

interface SimpleMetrics {
  lcp?: number;
  fcp?: number;
  cls?: number;
  ttfb?: number;
  inp?: number;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<SimpleMetrics>({});
  const [isLoading, setIsLoading] = useState(false);

  const refreshMetrics = () => {
    setIsLoading(true);
    
    // Получаем метрики из performance monitor
    const allMetrics = performanceMonitor.getMetrics();
    const latestMetrics: SimpleMetrics = {};
    
    // Находим последние значения для каждой метрики
    allMetrics.forEach((metric: PerformanceMetric) => {
      switch (metric.name) {
        case 'LCP':
          latestMetrics.lcp = metric.value;
          break;
        case 'FCP':
          latestMetrics.fcp = metric.value;
          break;
        case 'CLS':
          latestMetrics.cls = metric.value;
          break;
        case 'TTFB':
          latestMetrics.ttfb = metric.value;
          break;
        case 'INP':
          latestMetrics.inp = metric.value;
          break;
      }
    });
    
    setMetrics(latestMetrics);
    setTimeout(() => setIsLoading(false), 500);
  };

  useEffect(() => {
    // Инициализируем сбор метрик
    const handleMetric = (metric: any) => {
      setMetrics(prev => ({
        ...prev,
        [metric.name.toLowerCase()]: metric.value
      }));
    };

    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);

    refreshMetrics();
    
    // Обновляем метрики каждые 5 секунд
    const interval = setInterval(refreshMetrics, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getOverallRating = () => {
    const scores = [];
    if (metrics.lcp) scores.push(metrics.lcp <= THRESHOLDS.lcp.good ? 2 : metrics.lcp <= THRESHOLDS.lcp.poor ? 1 : 0);
    if (metrics.cls) scores.push(metrics.cls <= THRESHOLDS.cls.good ? 2 : metrics.cls <= THRESHOLDS.cls.poor ? 1 : 0);
    if (metrics.ttfb) scores.push(metrics.ttfb <= THRESHOLDS.ttfb.good ? 2 : metrics.ttfb <= THRESHOLDS.ttfb.poor ? 1 : 0);
    
    if (scores.length === 0) return 'unknown';
    
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avgScore >= 1.5) return 'good';
    if (avgScore >= 0.5) return 'needs-improvement';
    return 'poor';
  };

  const overallRating = getOverallRating();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time Web Vitals and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={overallRating === 'good' ? 'default' : overallRating === 'needs-improvement' ? 'secondary' : 'destructive'}>
            Overall: {overallRating}
          </Badge>
          <Button 
            onClick={refreshMetrics} 
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Largest Contentful Paint"
          value={metrics.lcp}
          unit="ms"
          threshold={THRESHOLDS.lcp}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Time to render the largest content element"
        />
        
        <MetricCard
          title="First Contentful Paint"
          value={metrics.fcp}
          unit="ms"
          threshold={THRESHOLDS.fcp}
          icon={<Zap className="h-4 w-4" />}
          description="Time to first content render"
        />
        
        <MetricCard
          title="Cumulative Layout Shift"
          value={metrics.cls}
          unit=""
          threshold={THRESHOLDS.cls}
          icon={<Activity className="h-4 w-4" />}
          description="Visual stability metric"
        />
        
        <MetricCard
          title="Time to First Byte"
          value={metrics.ttfb}
          unit="ms"
          threshold={THRESHOLDS.ttfb}
          icon={<Clock className="h-4 w-4" />}
          description="Server response time"
        />
        
        <MetricCard
          title="Interaction to Next Paint"
          value={metrics.inp}
          unit="ms"
          threshold={THRESHOLDS.inp}
          icon={<Activity className="h-4 w-4" />}
          description="Responsiveness metric"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            Recommendations based on current metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.lcp && metrics.lcp > THRESHOLDS.lcp.poor && (
              <div className="text-sm text-orange-600">
                • LCP is slow. Consider optimizing images and reducing server response time.
              </div>
            )}
            {metrics.cls && metrics.cls > THRESHOLDS.cls.poor && (
              <div className="text-sm text-orange-600">
                • High CLS detected. Ensure images and ads have dimensions set.
              </div>
            )}
            {metrics.ttfb && metrics.ttfb > THRESHOLDS.ttfb.poor && (
              <div className="text-sm text-orange-600">
                • Slow TTFB. Consider optimizing server performance or using a CDN.
              </div>
            )}
            {overallRating === 'good' && (
              <div className="text-sm text-green-600">
                ✓ All metrics are performing well!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}