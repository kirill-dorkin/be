import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Схема валидации для переключения статуса
const toggleStatusSchema = z.object({
  status: z.enum(['active', 'inactive'])
});

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

// Имитация базы данных (в реальном приложении это будет импорт из общего модуля)
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
  }
];

// POST - переключение статуса интеграции
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = toggleStatusSchema.parse(body);
    
    const integrationIndex = mockIntegrations.findIndex(item => item.id === id);
    
    if (integrationIndex === -1) {
      return NextResponse.json(
        { error: 'Интеграция не найдена' },
        { status: 404 }
      );
    }
    
    const integration = mockIntegrations[integrationIndex];
    
    // Проверяем, можно ли активировать интеграцию
    if (status === 'active' && integration.status === 'error') {
      return NextResponse.json(
        { error: 'Нельзя активировать интеграцию с ошибкой. Сначала исправьте проблему.' },
        { status: 400 }
      );
    }
    
    // Обновляем статус
    const updatedIntegration = {
      ...integration,
      status,
      updatedAt: new Date().toISOString(),
      // Сбрасываем ошибку при деактивации
      errorMessage: status === 'inactive' ? undefined : integration.errorMessage,
      // Обновляем время последней синхронизации при активации
      lastSync: status === 'active' ? new Date().toISOString() : integration.lastSync
    };
    
    mockIntegrations[integrationIndex] = updatedIntegration;
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json({
      message: `Интеграция ${status === 'active' ? 'активирована' : 'деактивирована'}`,
      integration: updatedIntegration
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверный статус', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Ошибка переключения статуса интеграции:', error);
    return NextResponse.json(
      { error: 'Ошибка переключения статуса интеграции' },
      { status: 500 }
    );
  }
}