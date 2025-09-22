import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Схема валидации для performance метрик
const PerformanceMetricSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  delta: z.number(),
  timestamp: z.number(),
  url: z.string().url(),
  userAgent: z.string(),
  connectionType: z.string().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  page: z.string().optional(),
  component: z.string().optional(),
  feature: z.string().optional(),
});

const PerformanceMetricsArraySchema = z.array(PerformanceMetricSchema);

// Интерфейс для аналитических данных
interface AnalyticsData {
  metrics: z.infer<typeof PerformanceMetricSchema>[];
  timestamp: number;
  source: 'web-vitals' | 'custom';
  environment: 'development' | 'production' | 'staging';
}

// Функция для определения окружения
function getEnvironment(): 'development' | 'production' | 'staging' {
  const env = process.env.NODE_ENV;
  if (env === 'production') return 'production';
  if (env === 'development') return 'development';
  return 'staging';
}

// Функция для логирования метрик (в реальном проекте здесь была бы отправка в аналитику)
async function logMetricsToAnalytics(data: AnalyticsData): Promise<void> {
  const environment = getEnvironment();
  
  // В development режиме просто логируем
  if (environment === 'development') {
    console.log('📊 Performance Analytics:', {
      metricsCount: data.metrics.length,
      timestamp: new Date(data.timestamp).toISOString(),
      source: data.source,
      environment: data.environment,
      metrics: data.metrics.map(m => ({
        name: m.name,
        value: m.value,
        rating: m.rating,
        url: m.url,
      })),
    });
    return;
  }

  // В production здесь была бы отправка в реальную аналитику
  try {
    // Пример отправки в внешнюю аналитику
    if (process.env.ANALYTICS_WEBHOOK_URL) {
      await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
        },
        body: JSON.stringify(data),
      });
    }
  } catch (error) {
    console.error('Failed to send metrics to external analytics:', error);
  }
}

// Функция для агрегации метрик
function aggregateMetrics(metrics: z.infer<typeof PerformanceMetricSchema>[]) {
  const aggregated = {
    totalMetrics: metrics.length,
    webVitals: metrics.filter(m => ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'].includes(m.name)),
    customMetrics: metrics.filter(m => !['LCP', 'INP', 'CLS', 'FCP', 'TTFB'].includes(m.name)),
    ratingDistribution: {
      good: metrics.filter(m => m.rating === 'good').length,
      needsImprovement: metrics.filter(m => m.rating === 'needs-improvement').length,
      poor: metrics.filter(m => m.rating === 'poor').length,
    },
    averageValues: {} as Record<string, number>,
  };

  // Вычисляем средние значения для каждого типа метрики
  const metricGroups = metrics.reduce((acc, metric) => {
    if (!acc[metric.name]) {
      acc[metric.name] = [];
    }
    acc[metric.name].push(metric.value);
    return acc;
  }, {} as Record<string, number[]>);

  Object.entries(metricGroups).forEach(([name, values]) => {
    aggregated.averageValues[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
  });

  return aggregated;
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { 
          error: 'Invalid content type',
          message: 'Expected application/json',
        },
        { status: 400 }
      );
    }

    // Парсим и валидируем данные
    const body = await request.json();
    
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { 
          error: 'Invalid data format',
          message: 'Expected array of metrics',
        },
        { status: 400 }
      );
    }

    // Валидируем метрики
    const validationResult = PerformanceMetricsArraySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          message: 'Invalid metric data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const metrics = validationResult.data;

    // Проверяем, что есть метрики для обработки
    if (metrics.length === 0) {
      return NextResponse.json(
        { 
          error: 'No metrics provided',
          message: 'At least one metric is required',
        },
        { status: 400 }
      );
    }

    // Определяем источник метрик
    const hasWebVitals = metrics.some(m => ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'].includes(m.name));
    const source = hasWebVitals ? 'web-vitals' : 'custom';

    // Подготавливаем данные для аналитики
    const analyticsData: AnalyticsData = {
      metrics,
      timestamp: Date.now(),
      source,
      environment: getEnvironment(),
    };

    // Отправляем в аналитику
    await logMetricsToAnalytics(analyticsData);

    // Агрегируем метрики для ответа
    const aggregated = aggregateMetrics(metrics);

    // Возвращаем успешный ответ
    return NextResponse.json({
      success: true,
      message: 'Metrics processed successfully',
      data: {
        processed: metrics.length,
        timestamp: analyticsData.timestamp,
        source: analyticsData.source,
        environment: analyticsData.environment,
        aggregated,
      },
    });

  } catch (error) {
    console.error('Error processing performance metrics:', error);

    // Возвращаем ошибку сервера
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process metrics',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

// GET endpoint для проверки состояния
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Performance analytics endpoint is running',
    timestamp: Date.now(),
    environment: getEnvironment(),
    endpoints: {
      POST: '/api/analytics/performance - Submit performance metrics',
    },
  });
}