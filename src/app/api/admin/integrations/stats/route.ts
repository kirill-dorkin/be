import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Интерфейс статистики
interface ApiStats {
  totalIntegrations: number;
  activeIntegrations: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uptime: number;
  typeDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  dailyRequests: Array<{
    date: string;
    requests: number;
    success: number;
    errors: number;
  }>;
  topIntegrations: Array<{
    id: string;
    name: string;
    requests: number;
    successRate: number;
  }>;
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

// GET - получение статистики интеграций
export async function GET(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    // Имитация данных интеграций (в реальном приложении это будет из базы данных)
    const mockIntegrations = [
      { id: '1', name: 'Stripe Payment Gateway', type: 'payment', status: 'active', requestCount: 1250, successRate: 98.5 },
      { id: '2', name: 'SendGrid Email Service', type: 'email', status: 'active', requestCount: 3420, successRate: 99.2 },
      { id: '3', name: 'Google Analytics 4', type: 'analytics', status: 'active', requestCount: 8950, successRate: 97.8 },
      { id: '4', name: 'Telegram Bot API', type: 'social', status: 'active', requestCount: 456, successRate: 100 },
      { id: '5', name: 'CDEK Delivery API', type: 'shipping', status: 'active', requestCount: 234, successRate: 95.7 },
      { id: '6', name: 'SMS.ru API', type: 'sms', status: 'inactive', requestCount: 89, successRate: 92.1 },
      { id: '7', name: 'Yandex.Disk API', type: 'storage', status: 'error', requestCount: 12, successRate: 0 },
      { id: '8', name: 'Bitrix24 CRM', type: 'crm', status: 'testing', requestCount: 5, successRate: 80 }
    ];
    
    // Расчет общей статистики
    const totalIntegrations = mockIntegrations.length;
    const activeIntegrations = mockIntegrations.filter(i => i.status === 'active').length;
    const totalRequests = mockIntegrations.reduce((sum, i) => sum + i.requestCount, 0);
    const successfulRequests = mockIntegrations.reduce((sum, i) => 
      sum + Math.round(i.requestCount * i.successRate / 100), 0
    );
    const failedRequests = totalRequests - successfulRequests;
    
    // Распределение по типам
    const typeDistribution = mockIntegrations.reduce((acc, integration) => {
      acc[integration.type] = (acc[integration.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Распределение по статусам
    const statusDistribution = mockIntegrations.reduce((acc, integration) => {
      acc[integration.status] = (acc[integration.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Генерация данных за последние 7 дней
    const dailyRequests = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const requests = Math.floor(Math.random() * 500) + 100;
      const success = Math.floor(requests * (0.95 + Math.random() * 0.05));
      
      dailyRequests.push({
        date: date.toISOString().split('T')[0],
        requests,
        success,
        errors: requests - success
      });
    }
    
    // Топ интеграций по количеству запросов
    const topIntegrations = mockIntegrations
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 5)
      .map(integration => ({
        id: integration.id,
        name: integration.name,
        requests: integration.requestCount,
        successRate: integration.successRate
      }));
    
    const stats: ApiStats = {
      totalIntegrations,
      activeIntegrations,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.floor(Math.random() * 200) + 50, // Имитация времени отклика
      uptime: 99.8, // Имитация uptime
      typeDistribution,
      statusDistribution,
      dailyRequests,
      topIntegrations
    };
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Ошибка получения статистики интеграций:', error);
    return NextResponse.json(
      { error: 'Ошибка получения статистики интеграций' },
      { status: 500 }
    );
  }
}