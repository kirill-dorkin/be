import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Простая схема валидации для тестов
const SimpleWebVitalsSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
});

// Расширенная схема для полных данных
const FullWebVitalsSchema = z.object({
  url: z.string().url().optional(),
  timestamp: z.number().optional(),
  userAgent: z.string().optional(),
  connectionType: z.string().optional(),
  id: z.string(),
  name: z.string(),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  delta: z.number().optional(),
  label: z.string().optional(),
  navigationType: z.string().optional(),
  metadata: z.string().optional(),
});

// Rate limiting (простая реализация в памяти)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (clientData.count >= RATE_LIMIT) {
    return false;
  }
  
  clientData.count++;
  return true;
}

export async function POST(request: NextRequest) {
  console.log('🚀 Web Vitals API: Received POST request');
  
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    console.log('📍 Request from IP:', ip);
    
    if (!checkRateLimit(ip)) {
      console.log('⚠️ Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    // Content type validation
    const contentType = request.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log('📦 Received Web Vitals data:', JSON.stringify(body, null, 2));
    } catch (error) {
      console.log('❌ Invalid JSON format:', error);
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Проверяем размер payload (примерно 50KB лимит)
    const bodySize = JSON.stringify(body).length;
    console.log('📏 Payload size:', bodySize, 'bytes');
    
    if (bodySize > 50000) {
      console.log('⚠️ Payload too large:', bodySize);
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      );
    }

    // Валидация данных - пробуем сначала простую схему, потом полную
    let validatedData;
    try {
      validatedData = SimpleWebVitalsSchema.parse(body);
      console.log('✅ Simple schema validation passed');
    } catch (simpleError) {
      console.log('⚠️ Simple schema failed, trying full schema');
      try {
        validatedData = FullWebVitalsSchema.parse(body);
        console.log('✅ Full schema validation passed');
      } catch (fullError) {
        console.log('❌ Both schemas failed:', fullError);
        const simpleErr = simpleError as z.ZodError;
        const fullErr = fullError as z.ZodError;
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: fullErr.errors || simpleErr.errors
          },
          { status: 422 }
        );
      }
    }

    // Логирование в development
    console.log('📊 [Web Vitals] Processed metric:', {
      id: validatedData.id,
      name: validatedData.name,
      value: validatedData.value,
      rating: validatedData.rating,
      timestamp: new Date().toISOString(),
    });

    // Возвращаем успешный ответ
    console.log('✅ Web Vitals data successfully processed');
    return NextResponse.json(
      { 
        success: true,
        message: 'Web vitals data received',
        id: validatedData.id
      },
      {
        status: 200,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Content-Security-Policy': "default-src 'self'",
        }
      }
    );

  } catch (error) {
    console.error('[Web Vitals API Error]', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'X-Content-Type-Options': 'nosniff',
        }
      }
    );
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { 
      message: 'Web Vitals API',
      methods: ['POST'],
      version: '1.0.0'
    },
    {
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600',
      }
    }
  );
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}