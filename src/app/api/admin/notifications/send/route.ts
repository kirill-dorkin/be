import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/dbConnect';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// Используем ту же схему уведомлений
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

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

// Схема для логов отправки
const NotificationLogSchema = new mongoose.Schema({
  notificationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Notification',
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  channel: { 
    type: String, 
    enum: ['email', 'push', 'in-app', 'sms'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'failed', 'bounced'], 
    default: 'pending' 
  },
  sentAt: { type: Date },
  failureReason: { type: String },
  metadata: {
    emailAddress: String,
    pushToken: String,
    phoneNumber: String,
    deliveryId: String,
    providerResponse: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const NotificationLog = mongoose.models.NotificationLog || mongoose.model('NotificationLog', NotificationLogSchema);

// Функция для получения списка получателей
async function getRecipients(notification: any) {
  const User = mongoose.models.User;
  let recipients: any[] = [];
  
  switch (notification.recipient) {
    case 'all':
      recipients = await User.find({}, '_id email name role').lean();
      break;
    case 'users':
      recipients = await User.find({ role: 'user' }, '_id email name role').lean();
      break;
    case 'admins':
      recipients = await User.find({ role: 'admin' }, '_id email name role').lean();
      break;
    case 'specific':
      recipients = await User.find(
        { _id: { $in: notification.recipients } }, 
        '_id email name role'
      ).lean();
      break;
  }
  
  return recipients;
}

// Функция для отправки email уведомления
async function sendEmailNotification(user: any, notification: any) {
  try {
    // Здесь должна быть интеграция с email провайдером (SendGrid, Mailgun, etc.)
    // Для демонстрации просто логируем
    console.log(`Отправка email уведомления пользователю ${user.email}:`);
    console.log(`Тема: ${notification.title}`);
    console.log(`Сообщение: ${notification.message}`);
    
    // Имитация отправки
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      deliveryId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error(`Ошибка отправки email пользователю ${user.email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
}

// Функция для отправки push уведомления
async function sendPushNotification(user: any, notification: any) {
  try {
    // Здесь должна быть интеграция с push сервисом (Firebase, OneSignal, etc.)
    console.log(`Отправка push уведомления пользователю ${user._id}:`);
    console.log(`Заголовок: ${notification.title}`);
    console.log(`Текст: ${notification.message}`);
    
    // Имитация отправки
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      success: true,
      deliveryId: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error(`Ошибка отправки push пользователю ${user._id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
}

// Функция для создания внутреннего уведомления
async function createInAppNotification(user: any, notification: any) {
  try {
    // Здесь должно быть создание записи во внутренней системе уведомлений
    console.log(`Создание внутреннего уведомления для пользователя ${user._id}`);
    
    return {
      success: true,
      deliveryId: `inapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error(`Ошибка создания внутреннего уведомления для пользователя ${user._id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
}

// POST - отправка уведомления
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
    const { notificationId, channels = ['in-app'] } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'ID уведомления обязателен' },
        { status: 400 }
      );
    }

    // Получение уведомления
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { error: 'Уведомление не найдено' },
        { status: 404 }
      );
    }

    if (notification.status === 'sent') {
      return NextResponse.json(
        { error: 'Уведомление уже отправлено' },
        { status: 400 }
      );
    }

    // Получение списка получателей
    const recipients = await getRecipients(notification);
    
    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'Получатели не найдены' },
        { status: 400 }
      );
    }

    // Статистика отправки
    const sendStats = {
      total: recipients.length,
      sent: 0,
      failed: 0,
      channels: {} as Record<string, { sent: number; failed: number }>
    };

    // Инициализация статистики по каналам
    channels.forEach((channel: string) => {
      sendStats.channels[channel] = { sent: 0, failed: 0 };
    });

    // Отправка уведомлений
    const sendPromises = recipients.map(async (user) => {
      const userResults = [];
      
      for (const channel of channels) {
        let result;
        
        switch (channel) {
          case 'email':
            result = await sendEmailNotification(user, notification);
            break;
          case 'push':
            result = await sendPushNotification(user, notification);
            break;
          case 'in-app':
            result = await createInAppNotification(user, notification);
            break;
          default:
            result = { success: false, error: 'Неподдерживаемый канал' };
        }
        
        // Создание лога отправки
        const log = new NotificationLog({
          notificationId: notification._id,
          userId: user._id,
          channel,
          status: result.success ? 'sent' : 'failed',
          sentAt: result.success ? new Date() : undefined,
          failureReason: result.success ? undefined : result.error,
          metadata: {
            emailAddress: channel === 'email' ? user.email : undefined,
            deliveryId: result.deliveryId
          }
        });
        
        await log.save();
        
        // Обновление статистики
        if (result.success) {
          sendStats.sent++;
          sendStats.channels[channel].sent++;
        } else {
          sendStats.failed++;
          sendStats.channels[channel].failed++;
        }
        
        userResults.push({ channel, success: result.success, error: result.error });
      }
      
      return { userId: user._id, results: userResults };
    });

    // Ожидание завершения всех отправок
    const results = await Promise.all(sendPromises);

    // Обновление статуса уведомления
    notification.status = 'sent';
    notification.sentAt = new Date();
    notification.readCount = 0; // Сброс счетчика прочтений
    await notification.save();

    // Логирование
    console.log(`Уведомление ${notificationId} отправлено:`);
    console.log(`Всего получателей: ${sendStats.total}`);
    console.log(`Успешно отправлено: ${sendStats.sent}`);
    console.log(`Ошибок: ${sendStats.failed}`);
    console.log(`Отправил: ${session.user.email} (${session.user.id})`);

    return NextResponse.json({
      message: 'Уведомление отправлено',
      stats: sendStats,
      results,
      notification: {
        id: notification._id,
        title: notification.title,
        status: notification.status,
        sentAt: notification.sentAt
      }
    });
  } catch (error) {
    console.error('Ошибка отправки уведомления:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}