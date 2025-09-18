import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// Используем существующую схему логов
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

const Log = mongoose.models.Log || mongoose.model('Log', LogSchema);

// Функция для конвертации в CSV
function convertToCSV(logs: any[]): string {
  if (logs.length === 0) {
    return 'Нет данных для экспорта';
  }

  const headers = [
    'Время',
    'Уровень',
    'Категория',
    'Действие',
    'Сообщение',
    'Email пользователя',
    'IP адрес',
    'Код статуса',
    'Длительность (мс)',
    'Конечная точка',
    'Метод',
    'Метаданные'
  ];

  const csvRows = [headers.join(',')];

  for (const log of logs) {
    const row = [
      `"${new Date(log.timestamp).toLocaleString('ru-RU')}"`,
      `"${log.level || ''}"`,
      `"${log.category || ''}"`,
      `"${log.action || ''}"`,
      `"${(log.message || '').replace(/"/g, '""')}"`,
      `"${log.userEmail || ''}"`,
      `"${log.ipAddress || ''}"`,
      `"${log.statusCode || ''}"`,
      `"${log.duration || ''}"`,
      `"${log.endpoint || ''}"`,
      `"${log.method || ''}"`,
      `"${log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : ''}"`
    ];
    csvRows.push(row.join(','));
  }

  return csvRows.join('\n');
}

// Функция для конвертации в JSON
function convertToJSON(logs: any[]): string {
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    totalRecords: logs.length,
    logs: logs.map(log => ({
      timestamp: log.timestamp,
      level: log.level,
      category: log.category,
      action: log.action,
      message: log.message,
      userEmail: log.userEmail,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      statusCode: log.statusCode,
      duration: log.duration,
      endpoint: log.endpoint,
      method: log.method,
      metadata: log.metadata
    }))
  }, null, 2);
}

// GET - Экспорт логов
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
    const format = searchParams.get('format') || 'csv'; // csv, json
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '10000'); // Максимум 10k записей

    // Построение фильтра
    const filter: any = {};

    if (level && level !== 'all') {
      filter.level = level;
    }

    if (category && category !== 'all') {
      filter.category = category;
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

    // Получение логов
    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'email name')
      .lean();

    if (logs.length === 0) {
      return NextResponse.json(
        { error: 'Нет данных для экспорта' },
        { status: 404 }
      );
    }

    // Логирование экспорта
    const exportLog = new Log({
      level: 'info',
      category: 'system',
      action: 'logs_export',
      message: `Экспортировано ${logs.length} записей логов в формате ${format}`,
      userId: session.user.id,
      userEmail: session.user.email,
      metadata: {
        format,
        recordsCount: logs.length,
        filter,
        exportedAt: new Date().toISOString()
      }
    });

    await exportLog.save();

    // Подготовка данных для экспорта
    let content: string;
    let contentType: string;
    let filename: string;

    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      content = convertToJSON(logs);
      contentType = 'application/json';
      filename = `logs-export-${dateStr}.json`;
    } else {
      content = convertToCSV(logs);
      contentType = 'text/csv';
      filename = `logs-export-${dateStr}.csv`;
    }

    // Возврат файла
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(content, 'utf8').toString()
      }
    });

  } catch (error) {
    console.error('Ошибка экспорта логов:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при экспорте' },
      { status: 500 }
    );
  }
}

// POST - Создание задачи экспорта (для больших объемов данных)
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
      format = 'csv',
      level,
      category,
      startDate,
      endDate,
      email
    } = body;

    // Построение фильтра
    const filter: any = {};

    if (level && level !== 'all') {
      filter.level = level;
    }

    if (category && category !== 'all') {
      filter.category = category;
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

    // Подсчет количества записей
    const totalRecords = await Log.countDocuments(filter);

    if (totalRecords === 0) {
      return NextResponse.json(
        { error: 'Нет данных для экспорта' },
        { status: 404 }
      );
    }

    // Если записей много, создаем задачу для фонового экспорта
    if (totalRecords > 50000) {
      // Здесь можно интегрировать с системой очередей (Redis, Bull, etc.)
      // Пока что возвращаем информацию о том, что нужно использовать GET запрос с лимитом
      
      return NextResponse.json({
        success: false,
        message: 'Слишком много записей для экспорта',
        totalRecords,
        suggestion: 'Используйте фильтры для уменьшения объема данных или экспортируйте по частям',
        maxRecordsPerExport: 10000
      }, { status: 413 });
    }

    // Для небольших объемов выполняем экспорт сразу
    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .populate('userId', 'email name')
      .lean();

    let content: string;
    let contentType: string;
    let filename: string;

    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      content = convertToJSON(logs);
      contentType = 'application/json';
      filename = `logs-export-${dateStr}.json`;
    } else {
      content = convertToCSV(logs);
      contentType = 'text/csv';
      filename = `logs-export-${dateStr}.csv`;
    }

    // Логирование экспорта
    const exportLog = new Log({
      level: 'info',
      category: 'system',
      action: 'logs_export_async',
      message: `Создана задача экспорта ${logs.length} записей логов`,
      userId: session.user.id,
      userEmail: session.user.email,
      metadata: {
        format,
        recordsCount: logs.length,
        filter,
        requestedEmail: email,
        exportedAt: new Date().toISOString()
      }
    });

    await exportLog.save();

    return NextResponse.json({
      success: true,
      data: {
        taskId: exportLog._id,
        recordsCount: logs.length,
        format,
        filename,
        downloadUrl: `/api/admin/logs/export?format=${format}&${new URLSearchParams(filter).toString()}`,
        estimatedSize: `${Math.round(Buffer.byteLength(content, 'utf8') / 1024)} KB`
      }
    });

  } catch (error) {
    console.error('Ошибка создания задачи экспорта:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}