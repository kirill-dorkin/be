import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Интерфейс метрик производительности
interface PerformanceMetrics {
  pageLoadTime: {
    average: number;
    p95: number;
    p99: number;
    trend: 'up' | 'down' | 'stable';
  };
  firstContentfulPaint: {
    average: number;
    p95: number;
    trend: 'up' | 'down' | 'stable';
  };
  largestContentfulPaint: {
    average: number;
    p95: number;
    trend: 'up' | 'down' | 'stable';
  };
  cumulativeLayoutShift: {
    average: number;
    p95: number;
    trend: 'up' | 'down' | 'stable';
  };
  firstInputDelay: {
    average: number;
    p95: number;
    trend: 'up' | 'down' | 'stable';
  };
  bundleSize: {
    total: number;
    javascript: number;
    css: number;
    images: number;
    fonts: number;
    trend: 'up' | 'down' | 'stable';
  };
  coreWebVitals: {
    score: number;
    lcp: { value: number; status: 'good' | 'needs-improvement' | 'poor' };
    fid: { value: number; status: 'good' | 'needs-improvement' | 'poor' };
    cls: { value: number; status: 'good' | 'needs-improvement' | 'poor' };
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  resourceOptimization: {
    compressionRatio: number;
    minificationSavings: number;
    imageOptimization: number;
    cacheHitRate: number;
  };
}

// Проверка прав администратора
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Требуется авторизация' },
      { status: 401 }
    );
  }
  
  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Недостаточно прав доступа' },
      { status: 403 }
    );
  }
  
  return null;
}

// Имитация метрик производительности
const mockPerformanceMetrics: PerformanceMetrics = {
  pageLoadTime: {
    average: 1.2,
    p95: 2.8,
    p99: 4.1,
    trend: 'down'
  },
  firstContentfulPaint: {
    average: 0.8,
    p95: 1.5,
    trend: 'down'
  },
  largestContentfulPaint: {
    average: 1.1,
    p95: 2.2,
    trend: 'stable'
  },
  cumulativeLayoutShift: {
    average: 0.05,
    p95: 0.12,
    trend: 'down'
  },
  firstInputDelay: {
    average: 15,
    p95: 45,
    trend: 'stable'
  },
  bundleSize: {
    total: 2.1, // MB
    javascript: 1.2,
    css: 0.3,
    images: 0.4,
    fonts: 0.2,
    trend: 'down'
  },
  coreWebVitals: {
    score: 92,
    lcp: { value: 1.1, status: 'good' },
    fid: { value: 15, status: 'good' },
    cls: { value: 0.05, status: 'good' }
  },
  lighthouse: {
    performance: 94,
    accessibility: 98,
    bestPractices: 92,
    seo: 96,
    pwa: 85
  },
  resourceOptimization: {
    compressionRatio: 0.68, // 68% сжатие
    minificationSavings: 0.35, // 35% экономии
    imageOptimization: 0.45, // 45% оптимизации изображений
    cacheHitRate: 0.87 // 87% попаданий в кэш
  }
};

// Генерация исторических данных
function generateHistoricalData(days: number = 30) {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Добавляем небольшие случайные вариации
    const variation = () => 0.9 + Math.random() * 0.2;
    
    data.push({
      date: date.toISOString().split('T')[0],
      pageLoadTime: mockPerformanceMetrics.pageLoadTime.average * variation(),
      firstContentfulPaint: mockPerformanceMetrics.firstContentfulPaint.average * variation(),
      largestContentfulPaint: mockPerformanceMetrics.largestContentfulPaint.average * variation(),
      cumulativeLayoutShift: mockPerformanceMetrics.cumulativeLayoutShift.average * variation(),
      bundleSize: mockPerformanceMetrics.bundleSize.total * variation(),
      lighthouseScore: mockPerformanceMetrics.lighthouse.performance * (0.95 + Math.random() * 0.1),
      coreWebVitalsScore: mockPerformanceMetrics.coreWebVitals.score * (0.95 + Math.random() * 0.1)
    });
  }
  
  return data;
}

// GET - получение метрик производительности
export async function GET(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const includeHistory = searchParams.get('history') === 'true';
    
    let days = 30;
    switch (period) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
    }
    
    const response: any = {
      metrics: mockPerformanceMetrics,
      period,
      lastUpdated: new Date().toISOString()
    };
    
    if (includeHistory) {
      response.history = generateHistoricalData(days);
    }
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Ошибка получения метрик производительности:', error);
    return NextResponse.json(
      { error: 'Ошибка получения метрик производительности' },
      { status: 500 }
    );
  }
}

// POST - запуск анализа производительности
export async function POST(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const body = await request.json();
    const { url, type = 'full' } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL обязателен для анализа' },
        { status: 400 }
      );
    }
    
    // Имитация запуска анализа
    const analysisId = `analysis_${Date.now()}`;
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      message: 'Анализ производительности запущен',
      analysisId,
      url,
      type,
      estimatedDuration: type === 'full' ? '2-3 минуты' : '30-60 секунд',
      status: 'running'
    }, { status: 202 });
  } catch (error) {
    console.error('Ошибка запуска анализа производительности:', error);
    return NextResponse.json(
      { error: 'Ошибка запуска анализа производительности' },
      { status: 500 }
    );
  }
}