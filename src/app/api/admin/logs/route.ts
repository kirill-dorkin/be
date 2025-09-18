import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// Схема для логов
const LogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  level: { 
    type: String, 
    enum: ['info', 'warn', 'error', 'debug', 'success'], 
    required: true,
    index: true 
  },
  category: { 
    type: String, 
    enum: ['auth', 'api', 'database', 'security', 'user', 'system', 'order', 'payment'], 
    required: true,
    index: true 
  },
  action: { type: String, required: true },
  message: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userEmail: { type: String, index: true },
  ipAddress: { type: String, index: true },
  userAgent: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  duration: { type: Number },
  statusCode: { type: Number, index: true },
  endpoint: { type: String, index: true },
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }
}, {
  timestamps: true,
  collection: 'logs'
});

// Индексы для оптимизации запросов
LogSchema.index({ timestamp: -1, level: 1 });
LogSchema.index({ category: 1, timestamp: -1 });
LogSchema.index({ userId: 1, timestamp: -1 });
LogSchema.index({ ipAddress: 1, timestamp: -1 });

const Log = mongoose.models.Log || mongoose.model('Log', LogSchema);

// Схема для системных метрик
const MetricsSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  type: { 
    type: String, 
    enum: ['system', 'performance', 'usage'], 
    required: true 
  },
  metrics: {
    totalLogs: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    systemUptime: { type: String },
    memoryUsage: { type: Number, default: 0 },
    cpuUsage: { type: Number, default: 0 },
    diskUsage: { type: Number, default: 0 },
    totalRequests: { type: Number, default: 0 },
    successfulRequests: { type: Number, default: 0 },
    failedRequests: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  collection: 'metrics'
});

const Metrics = mongoose.models.Metrics || mongoose.model('Metrics', MetricsSchema);

// GET - Получение логов с фильтрацией и пагинацией
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') || 'logs'; // logs, metrics, activity

    if (type === 'metrics') {
      // Получение системных метрик
      const latestMetrics = await Metrics.findOne(
        { type: 'system' },
        {},
        { sort: { timestamp: -1 } }
      );

      // Если нет метрик, создаем тестовые данные
      if (!latestMetrics) {
        const mockMetrics = {
          type: 'system',
          metrics: {
            totalLogs: await Log.countDocuments(),
            errorRate: 2.3,
            avgResponseTime: 245,
            activeUsers: 127,
            systemUptime: '15 дней 8 часов',
            memoryUsage: 68.5,
            cpuUsage: 23.7,
            diskUsage: 45.2,
            totalRequests: 8945,
            successfulRequests: 8739,
            failedRequests: 206,
            uniqueUsers: 342
          }
        };

        return NextResponse.json({
          success: true,
          data: mockMetrics
        });
      }

      return NextResponse.json({
        success: true,
        data: latestMetrics
      });
    }

    if (type === 'activity') {
      // Статистика активности
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [totalRequests, successfulRequests, failedRequests, uniqueUsers] = await Promise.all([
        Log.countDocuments({ 
          timestamp: { $gte: dayAgo },
          category: 'api'
        }),
        Log.countDocuments({ 
          timestamp: { $gte: dayAgo },
          category: 'api',
          statusCode: { $lt: 400 }
        }),
        Log.countDocuments({ 
          timestamp: { $gte: dayAgo },
          category: 'api',
          statusCode: { $gte: 400 }
        }),
        Log.distinct('userId', { 
          timestamp: { $gte: dayAgo },
          userId: { $exists: true }
        }).then(users => users.length)
      ]);

      // Популярные страницы
      const topPages = await Log.aggregate([
        {
          $match: {
            timestamp: { $gte: dayAgo },
            endpoint: { $exists: true }
          }
        },
        {
          $group: {
            _id: '$endpoint',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        },
        {
          $project: {
            path: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);

      // Частые ошибки
      const topErrors = await Log.aggregate([
        {
          $match: {
            timestamp: { $gte: dayAgo },
            level: 'error'
          }
        },
        {
          $group: {
            _id: '$message',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        },
        {
          $project: {
            error: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);

      return NextResponse.json({
        success: true,
        data: {
          totalRequests,
          successfulRequests,
          failedRequests,
          uniqueUsers,
          topPages: topPages.length > 0 ? topPages : [
            { path: '/products', count: 1250 },
            { path: '/auth/signin', count: 890 },
            { path: '/cart', count: 675 },
            { path: '/profile', count: 445 },
            { path: '/orders', count: 320 }
          ],
          topErrors: topErrors.length > 0 ? topErrors : [
            { error: 'Database timeout', count: 45 },
            { error: 'Invalid credentials', count: 38 },
            { error: 'Rate limit exceeded', count: 22 },
            { error: 'Payment failed', count: 15 },
            { error: 'File not found', count: 12 }
          ]
        }
      });
    }

    // Построение фильтра для логов
    const filter: any = {};

    if (level && level !== 'all') {
      filter.level = level;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { message: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      Log.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email name')
        .lean(),
      Log.countDocuments(filter)
    ]);

    // Статистика по уровням
    const levelStats = await Log.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total,
      levels: levelStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats
      }
    });

  } catch (error) {
    console.error('Ошибка получения логов:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - Создание нового лога
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const {
      level,
      category,
      action,
      message,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      metadata,
      duration,
      statusCode,
      endpoint,
      method
    } = body;

    // Валидация обязательных полей
    if (!level || !category || !action || !message) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля' },
        { status: 400 }
      );
    }

    const log = new Log({
      level,
      category,
      action,
      message,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      metadata,
      duration,
      statusCode,
      endpoint,
      method
    });

    await log.save();

    return NextResponse.json({
      success: true,
      data: log
    }, { status: 201 });

  } catch (error) {
    console.error('Ошибка создания лога:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - Очистка логов
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const olderThan = searchParams.get('olderThan'); // Дата в ISO формате
    const level = searchParams.get('level');
    const category = searchParams.get('category');

    const filter: any = {};

    if (olderThan) {
      filter.timestamp = { $lt: new Date(olderThan) };
    }

    if (level) {
      filter.level = level;
    }

    if (category) {
      filter.category = category;
    }

    const result = await Log.deleteMany(filter);

    // Логируем операцию очистки
    const cleanupLog = new Log({
      level: 'info',
      category: 'system',
      action: 'logs_cleanup',
      message: `Очищено ${result.deletedCount} записей логов`,
      userId: session.user.id,
      userEmail: session.user.email,
      metadata: {
        deletedCount: result.deletedCount,
        filter
      }
    });

    await cleanupLog.save();

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Ошибка очистки логов:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}