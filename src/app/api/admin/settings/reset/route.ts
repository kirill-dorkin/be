import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/dbConnect';
import { authOptions } from '@/auth';
import mongoose from 'mongoose';

// Используем ту же модель настроек
const SettingsSchema = new mongoose.Schema({
  // Общие настройки
  siteName: { type: String, default: 'Мой интернет-магазин' },
  siteDescription: { type: String, default: 'Описание сайта' },
  siteUrl: { type: String, default: 'https://example.com' },
  adminEmail: { type: String, default: 'admin@example.com' },
  supportEmail: { type: String, default: 'support@example.com' },
  
  // Настройки безопасности
  enableTwoFactor: { type: Boolean, default: false },
  sessionTimeout: { type: Number, default: 60 },
  maxLoginAttempts: { type: Number, default: 5 },
  passwordMinLength: { type: Number, default: 8 },
  requirePasswordChange: { type: Boolean, default: false },
  
  // Настройки уведомлений
  enableEmailNotifications: { type: Boolean, default: true },
  enablePushNotifications: { type: Boolean, default: false },
  notificationFrequency: { 
    type: String, 
    enum: ['immediate', 'hourly', 'daily'], 
    default: 'immediate' 
  },
  
  // Настройки производительности
  cacheEnabled: { type: Boolean, default: true },
  cacheTtl: { type: Number, default: 3600 },
  enableCompression: { type: Boolean, default: true },
  maxFileSize: { type: Number, default: 10485760 },
  
  // Настройки интеграций
  paymentProvider: { 
    type: String, 
    enum: ['stripe', 'paypal', 'both'], 
    default: 'stripe' 
  },
  enableAnalytics: { type: Boolean, default: false },
  analyticsProvider: { 
    type: String, 
    enum: ['google', 'yandex', 'custom'], 
    default: 'google' 
  },
  
  // Настройки интерфейса
  primaryColor: { type: String, default: '#3b82f6' },
  
  // Настройки контента
  defaultLanguage: { type: String, default: 'ru' },
  enableMultiLanguage: { type: Boolean, default: false },
  moderationEnabled: { type: Boolean, default: true },
  autoPublish: { type: Boolean, default: false },
  
  // Метаданные
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
}, {
  timestamps: true
});

SettingsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

// POST - сброс настроек к значениям по умолчанию
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

    // Удаляем все существующие настройки
    await Settings.deleteMany({});
    
    // Создаем новые настройки с дефолтными значениями
    const defaultSettings = new Settings({
      updatedBy: session.user.id,
      lastUpdated: new Date()
    });
    
    await defaultSettings.save();
    
    // Получаем созданные настройки с информацией об авторе
    const settings = await Settings.findById(defaultSettings._id)
      .populate('updatedBy', 'name email')
      .lean();

    // Логируем действие сброса
    console.log(`Настройки сброшены пользователем ${session.user.email} (${session.user.id}) в ${new Date().toISOString()}`);

    return NextResponse.json({
      settings,
      message: 'Настройки успешно сброшены к значениям по умолчанию',
      resetAt: new Date().toISOString(),
      resetBy: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      }
    });
  } catch (error) {
    console.error('Ошибка сброса настроек:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}