'use client';

import { useEffect, useState } from 'react';
import { performanceMonitor, type PerformanceMetric } from '@/lib/performance-monitor';

interface MetricCardProps {
  metric: PerformanceMetric;
  threshold?: { good: number; poor: number };
}

function MetricCard({ metric, threshold }: MetricCardProps) {
  const getStatus = () => {
    if (!threshold) return 'neutral';
    if (metric.value <= threshold.good) return 'good';
    if (metric.value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const status = getStatus();
  const statusColors = {
    good: 'bg-green-100 text-green-800 border-green-200',
    'needs-improvement': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    poor: 'bg-red-100 text-red-800 border-red-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const formatValue = (value: number, name: string) => {
    if (name === 'CLS') return value.toFixed(3);
    if (name.includes('Time') || name.includes('Duration')) return `${Math.round(value)}ms`;
    return Math.round(value).toString();
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${statusColors[status]} transition-all duration-300`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-sm">{metric.name}</h3>
        <span className="text-xs opacity-75">
          {new Date(metric.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className="text-2xl font-bold mb-1">
        {formatValue(metric.value, metric.name)}
      </div>
      {threshold && (
        <div className="text-xs opacity-75">
          Good: ≤{formatValue(threshold.good, metric.name)} | 
          Poor: &gt;{formatValue(threshold.poor, metric.name)}
        </div>
      )}
    </div>
  );
}

interface PerformanceMetricsProps {
  className?: string;
  showOnlyLatest?: boolean;
  maxMetrics?: number;
}

export function PerformanceMetrics({ 
  className = '', 
  showOnlyLatest = true,
  maxMetrics = 10 
}: PerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [lastSentTimestamp, setLastSentTimestamp] = useState(0);

  // Функция отправки метрик в API
  const sendMetricsToAPI = async (metricsToSend: PerformanceMetric[]) => {
    if (metricsToSend.length === 0) return;

    try {
      const response = await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricsToSend),
      });

      if (!response.ok) {
        console.warn('Failed to send performance metrics:', response.statusText);
      }
    } catch (error) {
      console.warn('Error sending performance metrics:', error);
    }
  };

  useEffect(() => {
    if (!performanceMonitor.isReady()) return;

    const updateMetrics = () => {
      const allMetrics = performanceMonitor.getMetrics();
      
      // Отправляем новые метрики в API
      const newMetrics = allMetrics.filter(metric => metric.timestamp > lastSentTimestamp);
      if (newMetrics.length > 0) {
        sendMetricsToAPI(newMetrics);
        setLastSentTimestamp(Math.max(...newMetrics.map(m => m.timestamp)));
      }
      
      if (showOnlyLatest) {
        // Показываем только последние метрики каждого типа
        const latestMetrics = new Map<string, PerformanceMetric>();
        allMetrics.forEach((metric: PerformanceMetric) => {
          const existing = latestMetrics.get(metric.name);
          if (!existing || metric.timestamp > existing.timestamp) {
            latestMetrics.set(metric.name, metric);
          }
        });
        setMetrics(Array.from(latestMetrics.values()).slice(-maxMetrics));
      } else {
        setMetrics(allMetrics.slice(-maxMetrics));
      }
    };

    // Обновляем метрики каждые 2 секунды
    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, [showOnlyLatest, maxMetrics, lastSentTimestamp]);

  // Показываем только в development или при нажатии Ctrl+Shift+P
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible || !performanceMonitor.isReady() || metrics.length === 0) {
    return null;
  }

  const config = performanceMonitor.getConfig();

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border p-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Performance Metrics</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            aria-label="Close metrics"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <MetricCard
              key={`${metric.name}-${metric.timestamp}-${index}`}
              metric={metric}
              threshold={config.thresholds[metric.name.toLowerCase() as keyof typeof config.thresholds]}
            />
          ))}
        </div>

        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          <div>Total metrics: {performanceMonitor.getMetrics().length}</div>
          <div>Press Ctrl+Shift+P to toggle</div>
        </div>
      </div>
    </div>
  );
}