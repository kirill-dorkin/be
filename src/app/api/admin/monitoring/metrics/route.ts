import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Валидационная схема для параметров метрик
const metricsFilterSchema = z.object({
  timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
  metrics: z.array(z.enum(['cpu', 'memory', 'disk', 'network', 'requests', 'errors'])).optional(),
  interval: z.enum(['1m', '5m', '15m', '1h', '1d']).default('5m')
});

// Интерфейсы для метрик
interface MetricPoint {
  timestamp: string;
  value: number;
}

interface SystemMetric {
  name: string;
  unit: string;
  current: number;
  average: number;
  max: number;
  min: number;
  data: MetricPoint[];
  status: 'healthy' | 'warning' | 'critical';
  threshold?: {
    warning: number;
    critical: number;
  };
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastCheck: string;
  metrics: SystemMetric[];
}

// Функция проверки прав администратора
async function checkAdminAccess(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer admin-token';
}

// Функция генерации исторических данных метрик
function generateMetricData(hours: number, interval: string): MetricPoint[] {
  const points: MetricPoint[] = [];
  const intervalMs = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000
  }[interval] || 5 * 60 * 1000; // default to 5 minutes

  const totalPoints = Math.floor((hours * 60 * 60 * 1000) / intervalMs);
  const now = Date.now();

  for (let i = totalPoints; i >= 0; i--) {
    const timestamp = new Date(now - (i * intervalMs)).toISOString();
    points.push({
      timestamp,
      value: Math.random() * 100
    });
  }

  return points;
}

// Функция получения статуса метрики
function getMetricStatus(current: number, threshold?: { warning: number; critical: number }): 'healthy' | 'warning' | 'critical' {
  if (!threshold) return 'healthy';
  
  if (current >= threshold.critical) return 'critical';
  if (current >= threshold.warning) return 'warning';
  return 'healthy';
}

// Имитированные системные метрики
function getMockMetrics(timeRange: string, interval: string): SystemMetric[] {
  const hours = {
    '1h': 1,
    '6h': 6,
    '24h': 24,
    '7d': 168,
    '30d': 720
  }[timeRange] || 24; // default to 24 hours

  const cpuData = generateMetricData(hours, interval).map(point => ({
    ...point,
    value: Math.random() * 100
  }));
  
  const memoryData = generateMetricData(hours, interval).map(point => ({
    ...point,
    value: 60 + Math.random() * 30
  }));
  
  const diskData = generateMetricData(hours, interval).map(point => ({
    ...point,
    value: 40 + Math.random() * 20
  }));
  
  const networkData = generateMetricData(hours, interval).map(point => ({
    ...point,
    value: Math.random() * 1000
  }));
  
  const requestsData = generateMetricData(hours, interval).map(point => ({
    ...point,
    value: Math.floor(Math.random() * 500)
  }));
  
  const errorsData = generateMetricData(hours, interval).map(point => ({
    ...point,
    value: Math.floor(Math.random() * 10)
  }));

  const metrics: SystemMetric[] = [
    {
      name: 'cpu',
      unit: '%',
      current: cpuData[cpuData.length - 1]?.value || 0,
      average: cpuData.reduce((sum, point) => sum + point.value, 0) / cpuData.length,
      max: Math.max(...cpuData.map(p => p.value)),
      min: Math.min(...cpuData.map(p => p.value)),
      data: cpuData,
      status: 'healthy',
      threshold: { warning: 70, critical: 90 }
    },
    {
      name: 'memory',
      unit: '%',
      current: memoryData[memoryData.length - 1]?.value || 0,
      average: memoryData.reduce((sum, point) => sum + point.value, 0) / memoryData.length,
      max: Math.max(...memoryData.map(p => p.value)),
      min: Math.min(...memoryData.map(p => p.value)),
      data: memoryData,
      status: 'healthy',
      threshold: { warning: 80, critical: 95 }
    },
    {
      name: 'disk',
      unit: '%',
      current: diskData[diskData.length - 1]?.value || 0,
      average: diskData.reduce((sum, point) => sum + point.value, 0) / diskData.length,
      max: Math.max(...diskData.map(p => p.value)),
      min: Math.min(...diskData.map(p => p.value)),
      data: diskData,
      status: 'healthy',
      threshold: { warning: 85, critical: 95 }
    },
    {
      name: 'network',
      unit: 'MB/s',
      current: networkData[networkData.length - 1]?.value || 0,
      average: networkData.reduce((sum, point) => sum + point.value, 0) / networkData.length,
      max: Math.max(...networkData.map(p => p.value)),
      min: Math.min(...networkData.map(p => p.value)),
      data: networkData,
      status: 'healthy'
    },
    {
      name: 'requests',
      unit: 'req/min',
      current: requestsData[requestsData.length - 1]?.value || 0,
      average: requestsData.reduce((sum, point) => sum + point.value, 0) / requestsData.length,
      max: Math.max(...requestsData.map(p => p.value)),
      min: Math.min(...requestsData.map(p => p.value)),
      data: requestsData,
      status: 'healthy'
    },
    {
      name: 'errors',
      unit: 'errors/min',
      current: errorsData[errorsData.length - 1]?.value || 0,
      average: errorsData.reduce((sum, point) => sum + point.value, 0) / errorsData.length,
      max: Math.max(...errorsData.map(p => p.value)),
      min: Math.min(...errorsData.map(p => p.value)),
      data: errorsData,
      status: 'healthy',
      threshold: { warning: 5, critical: 10 }
    }
  ];

  // Обновляем статусы на основе пороговых значений
  metrics.forEach(metric => {
    metric.status = getMetricStatus(metric.current, metric.threshold);
  });

  return metrics;
}

// GET - получение системных метрик
export async function GET(request: NextRequest) {
  try {
    // Проверка прав администратора
    const hasAccess = await checkAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Парсинг параметров запроса
    const { searchParams } = new URL(request.url);
    const filterParams = {
      timeRange: searchParams.get('timeRange') || '24h',
      metrics: searchParams.get('metrics')?.split(',') || undefined,
      interval: searchParams.get('interval') || '5m'
    };

    // Валидация параметров
    const validatedParams = metricsFilterSchema.parse(filterParams);

    // Получение метрик
    let systemMetrics = getMockMetrics(validatedParams.timeRange, validatedParams.interval);

    // Фильтрация по запрошенным метрикам
    if (validatedParams.metrics) {
      systemMetrics = systemMetrics.filter(metric => 
        validatedParams.metrics!.includes(metric.name as any)
      );
    }

    // Определение общего состояния системы
    const criticalCount = systemMetrics.filter(m => m.status === 'critical').length;
    const warningCount = systemMetrics.filter(m => m.status === 'warning').length;
    
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalCount > 0) {
      overallStatus = 'critical';
    } else if (warningCount > 0) {
      overallStatus = 'warning';
    }

    const systemHealth: SystemHealth = {
      overall: overallStatus,
      uptime: Math.floor(Math.random() * 30 * 24 * 60 * 60), // случайное время работы до 30 дней
      lastCheck: new Date().toISOString(),
      metrics: systemMetrics
    };

    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 400));

    return NextResponse.json({
      health: systemHealth,
      summary: {
        totalMetrics: systemMetrics.length,
        healthyCount: systemMetrics.filter(m => m.status === 'healthy').length,
        warningCount,
        criticalCount
      }
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - запуск проверки системы
export async function POST(request: NextRequest) {
  try {
    // Проверка прав администратора
    const hasAccess = await checkAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Валидация данных запроса
    const checkSchema = z.object({
      type: z.enum(['full', 'quick', 'specific']),
      metrics: z.array(z.string()).optional(),
      notify: z.boolean().default(false)
    });

    const validatedCheck = checkSchema.parse(body);

    // Имитация проверки системы
    await new Promise(resolve => setTimeout(resolve, 2000));

    const checkResults = {
      checkId: Date.now().toString(),
      type: validatedCheck.type,
      startTime: new Date().toISOString(),
      duration: Math.floor(Math.random() * 5000) + 1000, // 1-6 секунд
      status: 'completed',
      results: {
        issuesFound: Math.floor(Math.random() * 3),
        recommendations: [
          'Consider increasing memory allocation',
          'Monitor disk usage trends',
          'Review error rate patterns'
        ].slice(0, Math.floor(Math.random() * 3) + 1)
      }
    };

    return NextResponse.json({
      message: 'System check completed successfully',
      check: checkResults
    });

  } catch (error) {
    console.error('Error running system check:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid check parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}