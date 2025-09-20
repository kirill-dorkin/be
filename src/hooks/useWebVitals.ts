import { useState, useEffect } from 'react';
import { type Metric } from 'web-vitals';

interface WebVitalsMetrics {
  [key: string]: {
    name: string;
    value: number;
    unit: string;
    rating: 'good' | 'needs-improvement' | 'poor';
    label: string;
  };
}

interface WebVitalsSummary {
  good: number;
  needsImprovement: number;
  poor: number;
  total: number;
}

interface UseWebVitalsReturn {
  metrics: WebVitalsMetrics;
  summary: WebVitalsSummary;
  isLoading: boolean;
}

export function useWebVitals(): UseWebVitalsReturn {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateMetric = (metric: Metric) => {
      setMetrics(prev => ({
        ...prev,
        [metric.name]: {
          name: metric.name,
          value: metric.value,
          unit: metric.name === 'CLS' ? '' : 'ms',
          rating: metric.rating,
          label: getMetricLabel(metric.name)
        }
      }));
    };

    // Динамический импорт web-vitals
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB }) => {
      onCLS(updateMetric);
      onFCP(updateMetric);
      onLCP(updateMetric);
      onTTFB(updateMetric);
      setIsLoading(false);
    });
  }, []);

  const summary: WebVitalsSummary = {
    good: Object.values(metrics).filter(m => m.rating === 'good').length,
    needsImprovement: Object.values(metrics).filter(m => m.rating === 'needs-improvement').length,
    poor: Object.values(metrics).filter(m => m.rating === 'poor').length,
    total: Object.values(metrics).length
  };

  return { metrics, summary, isLoading };
}

function getMetricLabel(name: string): string {
  const labels: Record<string, string> = {
    CLS: 'Cumulative Layout Shift',
    FCP: 'First Contentful Paint',
    LCP: 'Largest Contentful Paint',
    TTFB: 'Time to First Byte'
  };
  return labels[name] || name;
}