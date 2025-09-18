import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Интерфейс статистики кэша
interface CacheStats {
  totalSize: string;
  totalKeys: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  memory: {
    used: string;
    available: string;
    percentage: number;
  };
  performance: {
    avgResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
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

// GET - получение статистики кэша
export async function GET(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    // Имитация получения статистики кэша
    // В реальном приложении здесь будет обращение к Redis или другой системе кэширования
    const stats: CacheStats = {
      totalSize: '2.4 GB',
      totalKeys: 15420,
      hitRate: 98.5,
      missRate: 1.5,
      evictions: 342,
      memory: {
        used: '2.4 GB',
        available: '8.0 GB',
        percentage: 30
      },
      performance: {
        avgResponseTime: 45,
        requestsPerSecond: 1250,
        errorRate: 0.2
      }
    };
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Ошибка получения статистики кэша:', error);
    return NextResponse.json(
      { error: 'Ошибка получения статистики кэша' },
      { status: 500 }
    );
  }
}