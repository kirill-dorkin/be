import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Схема валидации для очистки кэша
const clearCacheSchema = z.object({
  type: z.enum(['all', 'page', 'api', 'image', 'data', 'session']).optional(),
  keys: z.array(z.string()).optional(),
  pattern: z.string().optional()
});

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

// Функция имитации очистки кэша
async function clearCache(type?: string, keys?: string[], pattern?: string) {
  // Имитация времени очистки в зависимости от типа
  let clearTime = 500;
  let clearedCount = 0;
  
  if (type === 'all' || !type) {
    clearTime = 2000;
    clearedCount = 15420; // Все ключи
  } else {
    switch (type) {
      case 'page':
        clearTime = 800;
        clearedCount = 3240;
        break;
      case 'api':
        clearTime = 600;
        clearedCount = 2150;
        break;
      case 'image':
        clearTime = 1200;
        clearedCount = 8900;
        break;
      case 'data':
        clearTime = 400;
        clearedCount = 890;
        break;
      case 'session':
        clearTime = 300;
        clearedCount = 240;
        break;
      default:
        clearTime = 500;
        clearedCount = 100;
    }
  }
  
  if (keys && keys.length > 0) {
    clearTime = keys.length * 50;
    clearedCount = keys.length;
  }
  
  if (pattern) {
    clearTime = 700;
    clearedCount = Math.floor(Math.random() * 500) + 50;
  }
  
  // Имитация процесса очистки
  await new Promise(resolve => setTimeout(resolve, clearTime));
  
  return {
    clearedCount,
    type: type || 'all',
    duration: clearTime
  };
}

// POST - очистка кэша
export async function POST(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const body = await request.json();
    const { type, keys, pattern } = clearCacheSchema.parse(body);
    
    // Выполняем очистку кэша
    const result = await clearCache(type, keys, pattern);
    
    let message = '';
    if (type === 'all' || !type) {
      message = 'Весь кэш очищен';
    } else if (keys && keys.length > 0) {
      message = `Очищено ${keys.length} ключей`;
    } else if (pattern) {
      message = `Очищены ключи по шаблону: ${pattern}`;
    } else {
      message = `Очищен кэш типа: ${type}`;
    }
    
    return NextResponse.json({
      message,
      result: {
        clearedCount: result.clearedCount,
        type: result.type,
        duration: `${result.duration}ms`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные параметры очистки', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Ошибка очистки кэша:', error);
    return NextResponse.json(
      { error: 'Ошибка очистки кэша' },
      { status: 500 }
    );
  }
}

// GET - получение информации о возможных операциях очистки
export async function GET(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const cacheTypes = [
      {
        type: 'all',
        name: 'Весь кэш',
        description: 'Очистить все записи кэша',
        estimatedCount: 15420,
        estimatedTime: '2-3 секунды'
      },
      {
        type: 'page',
        name: 'Страницы',
        description: 'Кэш HTML страниц',
        estimatedCount: 3240,
        estimatedTime: '0.8 секунды'
      },
      {
        type: 'api',
        name: 'API ответы',
        description: 'Кэш API запросов',
        estimatedCount: 2150,
        estimatedTime: '0.6 секунды'
      },
      {
        type: 'image',
        name: 'Изображения',
        description: 'Кэш изображений',
        estimatedCount: 8900,
        estimatedTime: '1.2 секунды'
      },
      {
        type: 'data',
        name: 'Данные',
        description: 'Кэш структурированных данных',
        estimatedCount: 890,
        estimatedTime: '0.4 секунды'
      },
      {
        type: 'session',
        name: 'Сессии',
        description: 'Кэш пользовательских сессий',
        estimatedCount: 240,
        estimatedTime: '0.3 секунды'
      }
    ];
    
    return NextResponse.json({
      availableTypes: cacheTypes,
      lastCleared: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      totalSize: '2.4 GB',
      recommendations: [
        'Рекомендуется очищать кэш изображений еженедельно',
        'API кэш можно очищать при обновлении данных',
        'Сессии очищаются автоматически при истечении TTL'
      ]
    });
  } catch (error) {
    console.error('Ошибка получения информации об очистке кэша:', error);
    return NextResponse.json(
      { error: 'Ошибка получения информации об очистке кэша' },
      { status: 500 }
    );
  }
}