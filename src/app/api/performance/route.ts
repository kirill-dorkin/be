import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Схема для валидации метрик производительности
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
});

const PerformanceDataSchema = z.object({
  metrics: z.array(PerformanceMetricSchema),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

// POST - отправка метрик производительности
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PerformanceDataSchema.parse(body);

    // В production здесь можно отправлять данные в аналитику
    // Например, в Google Analytics, DataDog, или собственную систему
    if (process.env.NODE_ENV === 'production') {
      // Пример отправки в внешнюю аналитику
      await sendToAnalytics(validatedData);
    }

    // Логируем метрики в development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metrics:', {
        timestamp: new Date().toISOString(),
        metrics: validatedData.metrics.map(m => ({
          name: m.name,
          value: m.value,
          rating: m.rating,
          url: m.url
        }))
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Metrics received',
      count: validatedData.metrics.length 
    });

  } catch (error) {
    console.error('Error processing performance metrics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid data format',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// GET - получение агрегированных метрик (для админ панели)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const metricFilter = searchParams.get('metric');

    // В реальном приложении здесь бы был запрос к базе данных
    // Пока возвращаем mock данные для демонстрации
    const mockData = {
      timeframe,
      metricFilter,
      summary: {
        totalSessions: 1250,
        avgLCP: 2.1,
        avgINP: 180,
        avgCLS: 0.08,
        avgTTFB: 650,
        goodRating: 0.85,
        needsImprovementRating: 0.12,
        poorRating: 0.03
      },
      trends: [
        { timestamp: Date.now() - 86400000, lcp: 2.3, inp: 190, cls: 0.09 },
        { timestamp: Date.now() - 43200000, lcp: 2.1, inp: 180, cls: 0.08 },
        { timestamp: Date.now(), lcp: 2.0, inp: 170, cls: 0.07 }
      ]
    };

    return NextResponse.json(mockData);

  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch performance data' 
      },
      { status: 500 }
    );
  }
}

// Функция для отправки метрик в внешнюю аналитику
async function sendToAnalytics(data: z.infer<typeof PerformanceDataSchema>) {
  // Пример интеграции с Google Analytics 4
  if (process.env.GA_MEASUREMENT_ID) {
    try {
      const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: data.sessionId || 'anonymous',
          events: data.metrics.map(metric => ({
            name: 'web_vitals',
            params: {
              metric_name: metric.name,
              metric_value: metric.value,
              metric_rating: metric.rating,
              page_location: metric.url,
            }
          }))
        })
      });

      if (!response.ok) {
        console.error('Failed to send to GA:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending to analytics:', error);
    }
  }

  // Пример отправки в DataDog (если используется)
  if (process.env.DATADOG_API_KEY) {
    try {
      await fetch('https://api.datadoghq.com/api/v1/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': process.env.DATADOG_API_KEY,
        },
        body: JSON.stringify({
          series: data.metrics.map(metric => ({
            metric: `web_vitals.${metric.name}`,
            points: [[Math.floor(metric.timestamp / 1000), metric.value]],
            tags: [
              `rating:${metric.rating}`,
              `url:${new URL(metric.url).pathname}`,
            ]
          }))
        })
      });
    } catch (error) {
      console.error('Error sending to DataDog:', error);
    }
  }
}