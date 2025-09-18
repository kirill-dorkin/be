import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Схема валидации конфигурации кэша
const cacheConfigSchema = z.object({
  enabled: z.boolean().optional(),
  maxMemory: z.string().optional(),
  defaultTtl: z.number().min(60).max(86400).optional(),
  compressionEnabled: z.boolean().optional(),
  compressionLevel: z.number().min(1).max(9).optional(),
  evictionPolicy: z.enum(['lru', 'lfu', 'fifo', 'random']).optional(),
  persistToDisk: z.boolean().optional(),
  preloadEnabled: z.boolean().optional(),
  warmupOnStart: z.boolean().optional()
});

// Интерфейс конфигурации кэша
interface CacheConfig {
  enabled: boolean;
  maxMemory: string;
  defaultTtl: number;
  compressionEnabled: boolean;
  compressionLevel: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'random';
  persistToDisk: boolean;
  preloadEnabled: boolean;
  warmupOnStart: boolean;
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

// Имитация текущей конфигурации кэша
let mockCacheConfig: CacheConfig = {
  enabled: true,
  maxMemory: '8GB',
  defaultTtl: 3600,
  compressionEnabled: true,
  compressionLevel: 6,
  evictionPolicy: 'lru',
  persistToDisk: false,
  preloadEnabled: true,
  warmupOnStart: true
};

// GET - получение конфигурации кэша
export async function GET(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(mockCacheConfig);
  } catch (error) {
    console.error('Ошибка получения конфигурации кэша:', error);
    return NextResponse.json(
      { error: 'Ошибка получения конфигурации кэша' },
      { status: 500 }
    );
  }
}

// PUT - обновление конфигурации кэша
export async function PUT(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const body = await request.json();
    const updates = cacheConfigSchema.parse(body);
    
    // Обновляем конфигурацию
    mockCacheConfig = {
      ...mockCacheConfig,
      ...updates
    };
    
    // Имитация применения конфигурации
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json({
      message: 'Конфигурация кэша обновлена',
      config: mockCacheConfig
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные конфигурации', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Ошибка обновления конфигурации кэша:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления конфигурации кэша' },
      { status: 500 }
    );
  }
}

// POST - сброс конфигурации к значениям по умолчанию
export async function POST(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    // Сброс к значениям по умолчанию
    mockCacheConfig = {
      enabled: true,
      maxMemory: '4GB',
      defaultTtl: 3600,
      compressionEnabled: true,
      compressionLevel: 6,
      evictionPolicy: 'lru',
      persistToDisk: false,
      preloadEnabled: false,
      warmupOnStart: false
    };
    
    // Имитация применения конфигурации
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return NextResponse.json({
      message: 'Конфигурация кэша сброшена к значениям по умолчанию',
      config: mockCacheConfig
    });
  } catch (error) {
    console.error('Ошибка сброса конфигурации кэша:', error);
    return NextResponse.json(
      { error: 'Ошибка сброса конфигурации кэша' },
      { status: 500 }
    );
  }
}