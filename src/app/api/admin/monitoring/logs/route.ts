import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Типы метаданных для разных источников логов
interface DatabaseMetadata {
  connectionString?: string;
  retryCount?: number;
  queryTime?: number;
  affectedRows?: number;
}

interface SystemMetadata {
  memoryUsage?: string;
  cpuUsage?: string;
  diskUsage?: string;
  threshold?: string;
}

interface AuthMetadata {
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  loginMethod?: string;
}

interface CacheMetadata {
  key?: string;
  ttl?: number;
  hitRate?: number;
  size?: number;
}

interface ApiMetadata {
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  limit?: number;
  current?: number;
}

type LogMetadata = DatabaseMetadata | SystemMetadata | AuthMetadata | CacheMetadata | ApiMetadata | Record<string, unknown>;

// Валидационная схема для фильтрации логов
const logFilterSchema = z.object({
  level: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  source: z.string().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
  search: z.string().optional()
});

// Интерфейс для лога
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  source: string;
  userId?: string;
  metadata?: LogMetadata;
  stackTrace?: string;
}

// Функция проверки прав администратора
async function checkAdminAccess(request: NextRequest): Promise<boolean> {
  // Имитация проверки токена администратора
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer admin-token';
}

// Имитированные данные логов
const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00Z',
    level: 'error',
    message: 'Database connection failed',
    source: 'database',
    userId: 'user123',
    metadata: { connectionString: 'postgresql://...', retryCount: 3 },
    stackTrace: 'Error: Connection timeout\n    at Database.connect()\n    at ...'
  },
  {
    id: '2',
    timestamp: '2024-01-15T10:25:00Z',
    level: 'warn',
    message: 'High memory usage detected',
    source: 'system',
    metadata: { memoryUsage: '85%', threshold: '80%' }
  },
  {
    id: '3',
    timestamp: '2024-01-15T10:20:00Z',
    level: 'info',
    message: 'User logged in successfully',
    source: 'auth',
    userId: 'user456',
    metadata: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0...' }
  },
  {
    id: '4',
    timestamp: '2024-01-15T10:15:00Z',
    level: 'debug',
    message: 'Cache miss for key: user_profile_123',
    source: 'cache',
    metadata: { key: 'user_profile_123', ttl: 3600 }
  },
  {
    id: '5',
    timestamp: '2024-01-15T10:10:00Z',
    level: 'error',
    message: 'API rate limit exceeded',
    source: 'api',
    userId: 'user789',
    metadata: { endpoint: '/api/users', limit: 100, current: 101 }
  }
];

// GET - получение логов с фильтрацией
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
      level: searchParams.get('level') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      source: searchParams.get('source') || undefined,
      limit: parseInt(searchParams.get('limit') || '100'),
      offset: parseInt(searchParams.get('offset') || '0'),
      search: searchParams.get('search') || undefined
    };

    // Валидация параметров
    const validatedParams = logFilterSchema.parse(filterParams);

    // Фильтрация логов
    let filteredLogs = [...mockLogs];

    if (validatedParams.level) {
      filteredLogs = filteredLogs.filter(log => log.level === validatedParams.level);
    }

    if (validatedParams.source) {
      filteredLogs = filteredLogs.filter(log => log.source === validatedParams.source);
    }

    if (validatedParams.search) {
      const searchTerm = validatedParams.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchTerm) ||
        log.source.toLowerCase().includes(searchTerm)
      );
    }

    if (validatedParams.startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(validatedParams.startDate!)
      );
    }

    if (validatedParams.endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(validatedParams.endDate!)
      );
    }

    // Сортировка по времени (новые сначала)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Пагинация
    const total = filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(
      validatedParams.offset,
      validatedParams.offset + validatedParams.limit
    );

    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        total,
        limit: validatedParams.limit,
        offset: validatedParams.offset,
        hasMore: validatedParams.offset + validatedParams.limit < total
      },
      filters: {
        availableLevels: ['error', 'warn', 'info', 'debug'],
        availableSources: [...new Set(mockLogs.map(log => log.source))]
      }
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid filter parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - создание нового лога (для внутреннего использования)
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
    
    // Валидация данных лога
    const logSchema = z.object({
      level: z.enum(['error', 'warn', 'info', 'debug']),
      message: z.string().min(1).max(1000),
      source: z.string().min(1).max(100),
      userId: z.string().optional(),
      metadata: z.record(z.any()).optional(),
      stackTrace: z.string().optional()
    });

    const validatedLog = logSchema.parse(body);

    // Создание нового лога
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...validatedLog
    };

    // В реальном приложении здесь была бы запись в базу данных
    mockLogs.unshift(newLog);

    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      message: 'Log entry created successfully',
      log: newLog
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating log:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid log data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - очистка логов
export async function DELETE(request: NextRequest) {
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
    const olderThan = searchParams.get('olderThan'); // ISO date string
    const level = searchParams.get('level');
    const source = searchParams.get('source');

    let deletedCount = 0;

    if (olderThan) {
      const cutoffDate = new Date(olderThan);
      const initialLength = mockLogs.length;
      mockLogs.splice(0, mockLogs.length, ...mockLogs.filter(log => 
        new Date(log.timestamp) >= cutoffDate
      ));
      deletedCount = initialLength - mockLogs.length;
    } else if (level) {
      const initialLength = mockLogs.length;
      mockLogs.splice(0, mockLogs.length, ...mockLogs.filter(log => 
        log.level !== level
      ));
      deletedCount = initialLength - mockLogs.length;
    } else if (source) {
      const initialLength = mockLogs.length;
      mockLogs.splice(0, mockLogs.length, ...mockLogs.filter(log => 
        log.source !== source
      ));
      deletedCount = initialLength - mockLogs.length;
    } else {
      // Очистка всех логов
      deletedCount = mockLogs.length;
      mockLogs.splice(0, mockLogs.length);
    }

    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      message: 'Logs cleared successfully',
      deletedCount
    });

  } catch (error) {
    console.error('Error clearing logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}