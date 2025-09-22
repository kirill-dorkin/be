'use client';

import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface WebVitalsConfig {
  analyticsEndpoint: string;
  enableConsoleLogging: boolean;
  enableAnalytics: boolean;
}

class WebVitalsMonitor {
  private config: WebVitalsConfig = {
    analyticsEndpoint: '/api/analytics/web-vitals',
    enableConsoleLogging: process.env.NODE_ENV === 'development',
    enableAnalytics: true,
  };

  private metrics: Metric[] = [];

  init() {
    if (typeof window === 'undefined') return;

    // Собираем все Core Web Vitals
    onCLS(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));
  }

  private handleMetric(metric: Metric) {
    this.metrics.push(metric);

    if (this.config.enableConsoleLogging) {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value);
    }

    if (this.config.enableAnalytics) {
      this.sendToAnalytics(metric);
    }
  }

  private async sendToAnalytics(metric: Metric) {
    try {
      await fetch(this.config.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('[Web Vitals] Failed to send analytics:', error);
    }
  }

  getMetrics() {
    return [...this.metrics];
  }

  configure(config: Partial<WebVitalsConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Публичное свойство для конфигурации endpoint
  set analyticsEndpoint(endpoint: string) {
    this.config.analyticsEndpoint = endpoint;
  }
}

export const webVitalsMonitor = new WebVitalsMonitor();

// Утилиты для работы с метриками
export const getWebVitalsThresholds = () => ({
  LCP: { good: 2500, needsImprovement: 4000 },
  INP: { good: 200, needsImprovement: 500 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
});

export const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds = getWebVitalsThresholds();
  const threshold = thresholds[name as keyof typeof thresholds];
  
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};