import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Валидационная схема для алертов
const alertSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  metric: z.enum(['cpu', 'memory', 'disk', 'network', 'requests', 'errors', 'response_time']),
  condition: z.enum(['greater_than', 'less_than', 'equals', 'not_equals']),
  threshold: z.number(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  enabled: z.boolean().default(true),
  notifications: z.object({
    email: z.boolean().default(false),
    slack: z.boolean().default(false),
    webhook: z.boolean().default(false)
  }).optional()
});

const alertFilterSchema = z.object({
  status: z.enum(['active', 'resolved', 'acknowledged']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  metric: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

// Интерфейсы
interface Alert {
  id: string;
  name: string;
  description?: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  notifications?: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };
}

interface AlertInstance {
  id: string;
  alertId: string;
  status: 'active' | 'resolved' | 'acknowledged';
  triggeredAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  currentValue: number;
  threshold: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Функция проверки прав администратора
async function checkAdminAccess(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer admin-token';
}

// Имитированные данные алертов
const mockAlerts: Alert[] = [
  {
    id: '1',
    name: 'High CPU Usage',
    description: 'Alert when CPU usage exceeds 80%',
    metric: 'cpu',
    condition: 'greater_than',
    threshold: 80,
    severity: 'high',
    enabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    notifications: {
      email: true,
      slack: true,
      webhook: false
    }
  },
  {
    id: '2',
    name: 'Memory Critical',
    description: 'Critical alert for memory usage above 95%',
    metric: 'memory',
    condition: 'greater_than',
    threshold: 95,
    severity: 'critical',
    enabled: true,
    createdAt: '2024-01-10T10:05:00Z',
    updatedAt: '2024-01-10T10:05:00Z',
    notifications: {
      email: true,
      slack: true,
      webhook: true
    }
  },
  {
    id: '3',
    name: 'High Error Rate',
    description: 'Alert when error rate exceeds 5 errors per minute',
    metric: 'errors',
    condition: 'greater_than',
    threshold: 5,
    severity: 'medium',
    enabled: true,
    createdAt: '2024-01-10T10:10:00Z',
    updatedAt: '2024-01-10T10:10:00Z',
    notifications: {
      email: true,
      slack: false,
      webhook: false
    }
  }
];

// Имитированные экземпляры алертов
const mockAlertInstances: AlertInstance[] = [
  {
    id: 'inst_1',
    alertId: '1',
    status: 'active',
    triggeredAt: '2024-01-15T10:30:00Z',
    currentValue: 85,
    threshold: 80,
    message: 'CPU usage is at 85%, exceeding threshold of 80%',
    severity: 'high'
  },
  {
    id: 'inst_2',
    alertId: '3',
    status: 'acknowledged',
    triggeredAt: '2024-01-15T09:45:00Z',
    acknowledgedAt: '2024-01-15T10:00:00Z',
    acknowledgedBy: 'admin@example.com',
    currentValue: 7,
    threshold: 5,
    message: 'Error rate is at 7 errors/min, exceeding threshold of 5',
    severity: 'medium'
  },
  {
    id: 'inst_3',
    alertId: '2',
    status: 'resolved',
    triggeredAt: '2024-01-15T08:30:00Z',
    resolvedAt: '2024-01-15T09:15:00Z',
    currentValue: 92,
    threshold: 95,
    message: 'Memory usage was at 97%, exceeding threshold of 95%',
    severity: 'critical'
  }
];

// GET - получение алертов и их экземпляров
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'rules'; // 'rules' или 'instances'

    if (type === 'instances') {
      // Получение экземпляров алертов
      const filterParams = {
        status: searchParams.get('status') || undefined,
        severity: searchParams.get('severity') || undefined,
        metric: searchParams.get('metric') || undefined,
        limit: parseInt(searchParams.get('limit') || '50'),
        offset: parseInt(searchParams.get('offset') || '0')
      };

      const validatedParams = alertFilterSchema.parse(filterParams);

      let filteredInstances = [...mockAlertInstances];

      if (validatedParams.status) {
        filteredInstances = filteredInstances.filter(instance => 
          instance.status === validatedParams.status
        );
      }

      if (validatedParams.severity) {
        filteredInstances = filteredInstances.filter(instance => 
          instance.severity === validatedParams.severity
        );
      }

      // Сортировка по времени срабатывания (новые сначала)
      filteredInstances.sort((a, b) => 
        new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
      );

      const total = filteredInstances.length;
      const paginatedInstances = filteredInstances.slice(
        validatedParams.offset,
        validatedParams.offset + validatedParams.limit
      );

      // Добавляем информацию об алерте к каждому экземпляру
      const enrichedInstances = paginatedInstances.map(instance => {
        const alert = mockAlerts.find(a => a.id === instance.alertId);
        return {
          ...instance,
          alertName: alert?.name || 'Unknown Alert',
          alertMetric: alert?.metric || 'unknown'
        };
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      return NextResponse.json({
        instances: enrichedInstances,
        pagination: {
          total,
          limit: validatedParams.limit,
          offset: validatedParams.offset,
          hasMore: validatedParams.offset + validatedParams.limit < total
        },
        summary: {
          active: mockAlertInstances.filter(i => i.status === 'active').length,
          acknowledged: mockAlertInstances.filter(i => i.status === 'acknowledged').length,
          resolved: mockAlertInstances.filter(i => i.status === 'resolved').length
        }
      });
    } else {
      // Получение правил алертов
      const enabled = searchParams.get('enabled');
      const severity = searchParams.get('severity');

      let filteredAlerts = [...mockAlerts];

      if (enabled !== null) {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.enabled === (enabled === 'true')
        );
      }

      if (severity) {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.severity === severity
        );
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      return NextResponse.json({
        alerts: filteredAlerts,
        summary: {
          total: filteredAlerts.length,
          enabled: filteredAlerts.filter(a => a.enabled).length,
          disabled: filteredAlerts.filter(a => !a.enabled).length,
          bySeverity: {
            low: filteredAlerts.filter(a => a.severity === 'low').length,
            medium: filteredAlerts.filter(a => a.severity === 'medium').length,
            high: filteredAlerts.filter(a => a.severity === 'high').length,
            critical: filteredAlerts.filter(a => a.severity === 'critical').length
          }
        }
      });
    }

  } catch (error) {
    console.error('Error fetching alerts:', error);
    
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

// POST - создание нового алерта
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
    const validatedAlert = alertSchema.parse(body);

    // Создание нового алерта
    const newAlert: Alert = {
      id: Date.now().toString(),
      ...validatedAlert,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // В реальном приложении здесь была бы запись в базу данных
    mockAlerts.push(newAlert);

    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      message: 'Alert created successfully',
      alert: newAlert
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating alert:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid alert data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - обновление статуса экземпляра алерта
export async function PATCH(request: NextRequest) {
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
    
    const updateSchema = z.object({
      instanceId: z.string(),
      action: z.enum(['acknowledge', 'resolve']),
      userId: z.string().optional()
    });

    const { instanceId, action, userId } = updateSchema.parse(body);

    // Поиск экземпляра алерта
    const instanceIndex = mockAlertInstances.findIndex(i => i.id === instanceId);
    if (instanceIndex === -1) {
      return NextResponse.json(
        { error: 'Alert instance not found' },
        { status: 404 }
      );
    }

    const instance = mockAlertInstances[instanceIndex];
    const now = new Date().toISOString();

    if (action === 'acknowledge') {
      if (instance.status === 'active') {
        instance.status = 'acknowledged';
        instance.acknowledgedAt = now;
        instance.acknowledgedBy = userId || 'admin@example.com';
      }
    } else if (action === 'resolve') {
      if (instance.status === 'active' || instance.status === 'acknowledged') {
        instance.status = 'resolved';
        instance.resolvedAt = now;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      message: `Alert instance ${action}d successfully`,
      instance
    });

  } catch (error) {
    console.error('Error updating alert instance:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}