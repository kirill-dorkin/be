import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/dbConnect';
import { authOptions } from '@/auth';
import mongoose from 'mongoose';

// Схема уведомления
const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error'], 
    default: 'info' 
  },
  recipient: { 
    type: String, 
    enum: ['all', 'admins', 'users', 'specific'], 
    default: 'all' 
  },
  recipients: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'scheduled'], 
    default: 'draft' 
  },
  scheduledFor: { type: Date },
  sentAt: { type: Date },
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  totalRecipients: { type: Number, default: 0 },
  readCount: { type: Number, default: 0 },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  metadata: {
    channel: { 
      type: String, 
      enum: ['email', 'push', 'in-app', 'sms'], 
      default: 'in-app' 
    },
    priority: { 
      type: String, 
      enum: ['low', 'normal', 'high', 'urgent'], 
      default: 'normal' 
    },
    category: { 
      type: String, 
      enum: ['order', 'user', 'system', 'marketing', 'security'], 
      default: 'system' 
    },
    tags: [String],
    expiresAt: Date
  }
}, {
  timestamps: true
});

// Индексы для оптимизации запросов
NotificationSchema.index({ status: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, status: 1 });
NotificationSchema.index({ 'metadata.category': 1 });
NotificationSchema.index({ scheduledFor: 1 });

// Виртуальное поле для процента прочтения
NotificationSchema.virtual('readPercentage').get(function() {
  if (this.totalRecipients === 0) return 0;
  return Math.round((this.readCount / this.totalRecipients) * 100);
});

// Middleware для автоматического подсчета получателей
NotificationSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('recipient')) {
    try {
      const User = mongoose.models.User;
      let count = 0;
      
      switch (this.recipient) {
        case 'all':
          count = await User.countDocuments({});
          break;
        case 'users':
          count = await User.countDocuments({ role: 'user' });
          break;
        case 'admins':
          count = await User.countDocuments({ role: 'admin' });
          break;
        case 'specific':
          count = this.recipients ? this.recipients.length : 0;
          break;
      }
      
      this.totalRecipients = count;
    } catch (error) {
      console.error('Ошибка подсчета получателей:', error);
    }
  }
  next();
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

// GET - получение списка уведомлений
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // Построение фильтра
    const filter: any = {};
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (category && category !== 'all') {
      filter['metadata.category'] = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Получение уведомлений с пагинацией
    const notifications = await Notification.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    // Подсчет общего количества
    const total = await Notification.countDocuments(filter);
    
    // Статистика
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusStats = {
      draft: 0,
      sent: 0,
      scheduled: 0
    };
    
    stats.forEach(stat => {
      if (stat._id in statusStats) {
        statusStats[stat._id as keyof typeof statusStats] = stat.count;
      }
    });

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: statusStats
    });
  } catch (error) {
    console.error('Ошибка получения уведомлений:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - создание нового уведомления
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
      title, 
      message, 
      type = 'info', 
      recipient = 'all', 
      recipients = [],
      scheduledFor,
      metadata = {}
    } = body;

    // Валидация
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Заголовок и сообщение обязательны' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Заголовок не может быть длиннее 200 символов' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Сообщение не может быть длиннее 2000 символов' },
        { status: 400 }
      );
    }

    // Создание уведомления
    const notification = new Notification({
      title,
      message,
      type,
      recipient,
      recipients: recipient === 'specific' ? recipients : [],
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      status: scheduledFor ? 'scheduled' : 'draft',
      createdBy: session.user.id,
      metadata: {
        channel: metadata.channel || 'in-app',
        priority: metadata.priority || 'normal',
        category: metadata.category || 'system',
        tags: metadata.tags || [],
        expiresAt: metadata.expiresAt ? new Date(metadata.expiresAt) : undefined
      }
    });

    await notification.save();
    
    // Получение созданного уведомления с информацией об авторе
    const createdNotification = await Notification.findById(notification._id)
      .populate('createdBy', 'name email')
      .lean();

    // Логирование
    console.log(`Уведомление создано: ${notification._id} пользователем ${session.user.email}`);

    return NextResponse.json({
      notification: createdNotification,
      message: 'Уведомление успешно создано'
    }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания уведомления:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}