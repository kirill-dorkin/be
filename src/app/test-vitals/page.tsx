'use client';

import { useEffect, useState } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PerformanceDashboard } from '@/components/performance-dashboard';
import { performanceMonitor } from '@/lib/performance-monitor';

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export default function TestVitalsPage() {
  const [vitals, setVitals] = useState<WebVital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [monitorInitialized, setMonitorInitialized] = useState(false);

  const sendToAnalytics = async (metric: any) => {
    try {
      const response = await fetch('/api/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });

      if (response.ok) {
        console.log('✅ Metric sent successfully:', metric.name, metric.value);
      } else {
        console.error('❌ Failed to send metric:', response.status);
      }
    } catch (error) {
      console.error('❌ Error sending metric:', error);
    }
  };

  useEffect(() => {
    // Инициализируем новый монитор производительности
    try {
      performanceMonitor.init();
      setMonitorInitialized(true);
      console.log('🚀 Performance monitor initialized');
    } catch (error) {
      console.error('❌ Failed to initialize performance monitor:', error);
    }

    // Собираем все Web Vitals метрики (legacy)
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);

    // Обновляем локальное состояние для отображения
    const updateVital = (metric: any) => {
      setVitals(prev => {
        const existing = prev.find(v => v.name === metric.name);
        if (existing) {
          return prev.map(v => v.name === metric.name ? metric : v);
        }
        return [...prev, metric];
      });
    };

    onCLS(updateVital);
    onFCP(updateVital);
    onLCP(updateVital);
    onTTFB(updateVital);
  }, []);

  const testApiDirectly = async () => {
    setIsLoading(true);
    try {
      const testData = {
        id: `test-${Date.now()}`,
        name: 'LCP',
        value: 1234.5,
        rating: 'good' as const,
        delta: 100,
        entries: [],
        navigationType: 'navigate'
      };

      const response = await fetch('/api/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      console.log('🧪 Test API response:', result);
      
      if (response.ok) {
        alert('✅ Test successful! Check console for details.');
      } else {
        alert('❌ Test failed! Check console for details.');
      }
    } catch (error) {
      console.error('🧪 Test error:', error);
      alert('❌ Test error! Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeVariant = (rating: string) => {
    switch (rating) {
      case 'good': return 'default';
      case 'needs-improvement': return 'secondary';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Web Vitals Test</h1>
          <p className="text-muted-foreground">
            Тестирование сбора и отправки метрик производительности
          </p>
        </div>
        <Button onClick={testApiDirectly} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test API'}
        </Button>
      </div>

      {/* Новый дашборд производительности */}
      {monitorInitialized && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Advanced Performance Monitor</h2>
          <PerformanceDashboard />
        </div>
      )}

      {/* Legacy Web Vitals отображение */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Legacy Web Vitals</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vitals.map((vital) => (
            <Card key={vital.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{vital.name}</CardTitle>
                <Badge variant={getBadgeVariant(vital.rating)}>
                  {vital.rating}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(vital.value)}
                  {vital.name === 'CLS' ? '' : 'ms'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Delta: {Math.round(vital.delta)}{vital.name === 'CLS' ? '' : 'ms'}
                </p>
                <p className="text-xs text-muted-foreground">
                  ID: {vital.id.substring(0, 8)}...
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {vitals.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Сбор метрик...</CardTitle>
              <CardDescription>
                Web Vitals метрики собираются автоматически. Взаимодействуйте со страницей для получения INP.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Инструкции</CardTitle>
          <CardDescription>Как тестировать Web Vitals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>LCP (Largest Contentful Paint):</strong> Автоматически измеряется при загрузке</p>
          <p><strong>INP (Interaction to Next Paint):</strong> Кликните или нажмите клавишу для измерения</p>
          <p><strong>CLS (Cumulative Layout Shift):</strong> Автоматически отслеживается</p>
          <p><strong>FCP (First Contentful Paint):</strong> Автоматически измеряется при загрузке</p>
          <p><strong>TTFB (Time to First Byte):</strong> Автоматически измеряется при загрузке</p>
        </CardContent>
      </Card>
    </div>
  );
}