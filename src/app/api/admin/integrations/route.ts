import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Типы конфигурации для разных интеграций
interface PaymentConfig {
  currency: string;
  captureMethod: 'automatic' | 'manual';
  paymentMethods: string[];
}

interface EmailConfig {
  fromEmail: string;
  fromName: string;
  templates: Record<string, string>;
}

interface AnalyticsConfig {
  measurementId: string;
  events: string[];
  enhanced_ecommerce: boolean;
}

interface SocialConfig {
  chatId: string;
  notifications: string[];
  parseMode: 'HTML' | 'Markdown';
}

interface ShippingConfig {
  account: string;
  tariffs: number[];
  services: string[];
  testMode: boolean;
}

interface SmsConfig {
  from: string;
  test: boolean;
  translit: boolean;
}

interface StorageConfig {
  backupPath: string;
  schedule: 'daily' | 'weekly' | 'monthly';
  retention: number;
}

interface CrmConfig {
  dealStages: Record<string, string>;
  contactFields: string[];
  syncInterval: number;
}

type IntegrationConfig = PaymentConfig | EmailConfig | AnalyticsConfig | SocialConfig | ShippingConfig | SmsConfig | StorageConfig | CrmConfig | Record<string, unknown>;

// Схема валидации для создания интеграции
const createIntegrationSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Название слишком длинное'),
  type: z.enum(['payment', 'email', 'analytics', 'crm', 'social', 'shipping', 'sms', 'storage', 'other']),
  description: z.string().min(1, 'Описание обязательно').max(500, 'Описание слишком длинное'),
  endpoint: z.string().url('Неверный формат URL'),
  apiKey: z.string().min(1, 'API ключ обязателен'),
  secretKey: z.string().optional(),
  webhookUrl: z.string().url('Неверный формат webhook URL').optional().or(z.literal('')),
  config: z.record(z.unknown()).default({})
});

// Модель данных
interface ApiIntegration {
  id: string;
  name: string;
  type: 'payment' | 'email' | 'analytics' | 'crm' | 'social' | 'shipping' | 'sms' | 'storage' | 'other';
  description: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  endpoint: string;
  apiKey: string;
  secretKey?: string;
  webhookUrl?: string;
  config: IntegrationConfig;
  lastSync?: string;
  errorMessage?: string;
  requestCount: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
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

// Имитация базы данных
let mockIntegrations: ApiIntegration[] = [
  {
    id: '1',
    name: 'Stripe Payment Gateway',
    type: 'payment',
    description: 'Обработка платежей через Stripe',
    status: 'active',
    endpoint: 'https://api.stripe.com/v1',
    apiKey: 'sk_test_***',
    secretKey: 'whsec_***',
    webhookUrl: 'https://yoursite.com/api/webhooks/stripe',
    config: {
      currency: 'RUB',
      captureMethod: 'automatic',
      paymentMethods: ['card', 'apple_pay', 'google_pay']
    },
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    requestCount: 1250,
    successRate: 98.5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'SendGrid Email Service',
    type: 'email',
    description: 'Отправка транзакционных email через SendGrid',
    status: 'active',
    endpoint: 'https://api.sendgrid.com/v3',
    apiKey: 'SG.***',
    webhookUrl: 'https://yoursite.com/api/webhooks/sendgrid',
    config: {
      fromEmail: 'noreply@bestelectronics.ru',
      fromName: 'Best Electronics',
      templates: {
        welcome: 'd-123456',
        orderConfirmation: 'd-789012',
        passwordReset: 'd-345678'
      }
    },
    lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    requestCount: 3420,
    successRate: 99.2,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Google Analytics 4',
    type: 'analytics',
    description: 'Отслеживание событий и конверсий',
    status: 'active',
    endpoint: 'https://www.google-analytics.com/mp/collect',
    apiKey: 'G-***',
    secretKey: 'measurement_protocol_secret',
    config: {
      measurementId: 'G-XXXXXXXXXX',
      events: ['purchase', 'add_to_cart', 'view_item', 'begin_checkout'],
      enhanced_ecommerce: true
    },
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    requestCount: 8950,
    successRate: 97.8,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    name: 'Telegram Bot API',
    type: 'social',
    description: 'Уведомления в Telegram канал',
    status: 'active',
    endpoint: 'https://api.telegram.org/bot',
    apiKey: '123456789:***',
    config: {
      chatId: '-1001234567890',
      notifications: ['new_order', 'low_stock', 'system_alerts'],
      parseMode: 'HTML'
    },
    lastSync: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    requestCount: 456,
    successRate: 100,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    name: 'CDEK Delivery API',
    type: 'shipping',
    description: 'Расчет стоимости и создание заказов доставки',
    status: 'active',
    endpoint: 'https://api.cdek.ru/v2',
    apiKey: 'account_***',
    secretKey: 'secure_password',
    config: {
      account: 'your_account',
      tariffs: [136, 137, 138, 139],
      services: ['INSURANCE', 'DELIVERY_TO_DOOR'],
      testMode: false
    },
    lastSync: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    requestCount: 234,
    successRate: 95.7,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: '6',
    name: 'SMS.ru API',
    type: 'sms',
    description: 'Отправка SMS уведомлений',
    status: 'inactive',
    endpoint: 'https://sms.ru/sms/send',
    apiKey: 'your_api_key',
    config: {
      from: 'SHOP',
      test: false,
      translit: false
    },
    requestCount: 89,
    successRate: 92.1,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '7',
    name: 'Yandex.Disk API',
    type: 'storage',
    description: 'Резервное копирование данных',
    status: 'error',
    endpoint: 'https://cloud-api.yandex.net/v1/disk',
    apiKey: 'OAuth_token',
    config: {
      backupPath: '/backups/shop',
      schedule: 'daily',
      retention: 30
    },
    errorMessage: 'Недействительный OAuth токен',
    requestCount: 12,
    successRate: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '8',
    name: 'Bitrix24 CRM',
    type: 'crm',
    description: 'Синхронизация клиентов и заказов',
    status: 'testing',
    endpoint: 'https://your-portal.bitrix24.ru/rest',
    apiKey: 'webhook_key',
    config: {
      dealStages: {
        'new': 'NEW',
        'processing': 'PREPARATION',
        'shipped': 'PREPAYMENT_INVOICE',
        'delivered': 'WON'
      },
      contactFields: ['NAME', 'EMAIL', 'PHONE'],
      syncInterval: 3600
    },
    requestCount: 5,
    successRate: 80,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  }
];

// GET - получение всех интеграций
export async function GET(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let filteredIntegrations = [...mockIntegrations];
    
    // Фильтрация по типу
    if (type && type !== 'all') {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.type === type);
    }
    
    // Фильтрация по статусу
    if (status && status !== 'all') {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.status === status);
    }
    
    // Поиск по названию и описанию
    if (search) {
      const searchLower = search.toLowerCase();
      filteredIntegrations = filteredIntegrations.filter(integration => 
        integration.name.toLowerCase().includes(searchLower) ||
        integration.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json({
      integrations: filteredIntegrations,
      total: filteredIntegrations.length
    });
  } catch (error) {
    console.error('Ошибка получения интеграций:', error);
    return NextResponse.json(
      { error: 'Ошибка получения интеграций' },
      { status: 500 }
    );
  }
}

// POST - создание новой интеграции
export async function POST(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const body = await request.json();
    const validatedData = createIntegrationSchema.parse(body);
    
    // Проверка уникальности названия
    const existingIntegration = mockIntegrations.find(integration => 
      integration.name.toLowerCase() === validatedData.name.toLowerCase()
    );
    
    if (existingIntegration) {
      return NextResponse.json(
        { error: 'Интеграция с таким названием уже существует' },
        { status: 400 }
      );
    }
    
    const now = new Date().toISOString();
    const newIntegration: ApiIntegration = {
      id: (mockIntegrations.length + 1).toString(),
      ...validatedData,
      status: 'inactive',
      requestCount: 0,
      successRate: 0,
      createdAt: now,
      updatedAt: now
    };
    
    mockIntegrations.push(newIntegration);
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      message: 'Интеграция успешно создана',
      integration: newIntegration
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Ошибка создания интеграции:', error);
    return NextResponse.json(
      { error: 'Ошибка создания интеграции' },
      { status: 500 }
    );
  }
}