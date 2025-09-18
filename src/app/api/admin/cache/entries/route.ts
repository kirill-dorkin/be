import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Интерфейс записи кэша
interface CacheEntry {
  key: string;
  size: string;
  ttl: number;
  hitCount: number;
  lastAccessed: string;
  type: 'page' | 'api' | 'image' | 'data' | 'session';
  status: 'active' | 'expired' | 'evicted';
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

// Имитация данных кэша
const mockCacheEntries: CacheEntry[] = [
  {
    key: 'page:/products',
    size: '245 KB',
    ttl: 3600,
    hitCount: 1250,
    lastAccessed: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    type: 'page',
    status: 'active'
  },
  {
    key: 'api:/api/products?category=laptops',
    size: '89 KB',
    ttl: 1800,
    hitCount: 890,
    lastAccessed: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    type: 'api',
    status: 'active'
  },
  {
    key: 'image:/images/laptop-1.jpg',
    size: '1.2 MB',
    ttl: 86400,
    hitCount: 2340,
    lastAccessed: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    type: 'image',
    status: 'active'
  },
  {
    key: 'session:user_12345',
    size: '12 KB',
    ttl: 7200,
    hitCount: 45,
    lastAccessed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    type: 'session',
    status: 'active'
  },
  {
    key: 'data:categories_tree',
    size: '156 KB',
    ttl: 3600,
    hitCount: 567,
    lastAccessed: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    type: 'data',
    status: 'active'
  },
  {
    key: 'page:/admin/dashboard',
    size: '78 KB',
    ttl: 1800,
    hitCount: 123,
    lastAccessed: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    type: 'page',
    status: 'expired'
  },
  {
    key: 'api:/api/orders/stats',
    size: '34 KB',
    ttl: 900,
    hitCount: 234,
    lastAccessed: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    type: 'api',
    status: 'expired'
  },
  {
    key: 'image:/images/old-banner.jpg',
    size: '2.1 MB',
    ttl: 86400,
    hitCount: 12,
    lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'image',
    status: 'evicted'
  },
  {
    key: 'data:user_preferences_67890',
    size: '8 KB',
    ttl: 3600,
    hitCount: 89,
    lastAccessed: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    type: 'data',
    status: 'active'
  },
  {
    key: 'page:/search?q=gaming+laptop',
    size: '198 KB',
    ttl: 1800,
    hitCount: 456,
    lastAccessed: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    type: 'page',
    status: 'active'
  }
];

// GET - получение записей кэша
export async function GET(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let filteredEntries = [...mockCacheEntries];
    
    // Фильтрация по типу
    if (type && type !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.type === type);
    }
    
    // Фильтрация по статусу
    if (status && status !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.status === status);
    }
    
    // Поиск по ключу
    if (search) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.key.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return NextResponse.json({
      entries: paginatedEntries,
      pagination: {
        page,
        limit,
        total: filteredEntries.length,
        totalPages: Math.ceil(filteredEntries.length / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка получения записей кэша:', error);
    return NextResponse.json(
      { error: 'Ошибка получения записей кэша' },
      { status: 500 }
    );
  }
}