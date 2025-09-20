import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Схема валидации для Web Vitals метрик
const WebVitalsSchema = z.object({
  url: z.string().url(),
  timestamp: z.number(),
  userAgent: z.string(),
  connectionType: z.string(),
  metrics: z.array(z.object({
    id: z.string(),
    name: z.string(),
    value: z.number(),
    delta: z.number(),
    rating: z.enum(['good', 'needs-improvement', 'poor']),
    label: z.string(),
    navigationType: z.string().optional(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входящих данных
    const validatedData = WebVitalsSchema.parse(body);
    
    // В реальном приложении здесь бы была отправка в аналитику
    // Например, в Google Analytics, DataDog, или собственную БД
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals Analytics]', {
        url: validatedData.url,
        timestamp: new Date(validatedData.timestamp).toISOString(),
        userAgent: validatedData.userAgent,
        connectionType: validatedData.connectionType,
        metrics: validatedData.metrics.map(metric => ({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
        })),
      });
    }
    
    // Пример интеграции с внешними сервисами
    await Promise.allSettled([
      // Google Analytics 4
      sendToGA4(validatedData),
      // DataDog RUM
      sendToDataDog(validatedData),
      // Собственная база данных
      saveToDatabase(validatedData),
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Web Vitals API Error]', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Интеграция с Google Analytics 4
async function sendToGA4(data: z.infer<typeof WebVitalsSchema>) {
  if (!process.env.GA_MEASUREMENT_ID) return;
  
  try {
    const params = new URLSearchParams({
      measurement_id: process.env.GA_MEASUREMENT_ID,
      api_secret: process.env.GA_API_SECRET || '',
    });
    
    const events = data.metrics.map(metric => ({
      name: 'web_vitals',
      params: {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        page_location: data.url,
        user_agent: data.userAgent,
        connection_type: data.connectionType,
      },
    }));
    
    await fetch(`https://www.google-analytics.com/mp/collect?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: generateClientId(data.userAgent),
        events,
      }),
    });
  } catch (error) {
    console.error('[GA4 Error]', error);
  }
}

// Интеграция с DataDog RUM
async function sendToDataDog(data: z.infer<typeof WebVitalsSchema>) {
  if (!process.env.DATADOG_CLIENT_TOKEN) return;
  
  try {
    const payload = {
      ddsource: 'browser',
      ddtags: `env:${process.env.NODE_ENV}`,
      message: 'Web Vitals Metrics',
      level: 'info',
      timestamp: data.timestamp,
      attributes: {
        url: data.url,
        userAgent: data.userAgent,
        connectionType: data.connectionType,
        metrics: data.metrics,
      },
    };
    
    await fetch('https://browser-intake-datadoghq.com/v1/input/browser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': process.env.DATADOG_CLIENT_TOKEN,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('[DataDog Error]', error);
  }
}

// Сохранение в базу данных
async function saveToDatabase(data: z.infer<typeof WebVitalsSchema>) {
  // Здесь была бы интеграция с вашей БД
  // Например, с Prisma, Drizzle или прямыми SQL запросами
  
  try {
    // Пример структуры для PostgreSQL:
    /*
    INSERT INTO web_vitals_metrics (
      url, timestamp, user_agent, connection_type, 
      metric_name, metric_value, metric_rating, metric_delta
    ) VALUES ...
    */
    
    console.log('[Database] Would save metrics:', data.metrics.length);
  } catch (error) {
    console.error('[Database Error]', error);
  }
}

// Генерация client_id для GA4
function generateClientId(userAgent: string): string {
  // Простая хеш-функция для генерации стабильного client_id
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Конвертация в 32-битное число
  }
  return Math.abs(hash).toString();
}