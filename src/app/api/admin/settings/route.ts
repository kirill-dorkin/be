import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/dbConnect';
import { authOptions } from '@/auth';
import mongoose from 'mongoose';

// Модель для настроек приложения
const SettingsSchema = new mongoose.Schema({
  // Общие настройки
  siteName: { type: String, default: 'Мой интернет-магазин' },
  siteDescription: { type: String, default: 'Описание сайта' },
  siteUrl: { type: String, default: 'https://example.com' },
  adminEmail: { type: String, default: 'admin@example.com' },
  supportEmail: { type: String, default: 'support@example.com' },
  
  // Настройки безопасности
  enableTwoFactor: { type: Boolean, default: false },
  sessionTimeout: { type: Number, default: 60 }, // минуты
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
  cacheTtl: { type: Number, default: 3600 }, // секунды
  enableCompression: { type: Boolean, default: true },
  maxFileSize: { type: Number, default: 10485760 }, // байты (10MB)
  
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

// Обновляем lastUpdated при сохранении
SettingsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

// GET - получение настроек
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

    // Получаем настройки или создаем дефолтные
    let settings = await Settings.findOne().populate('updatedBy', 'name email').lean();
    
    if (!settings) {
      // Создаем настройки по умолчанию
      const defaultSettings = new Settings({
        updatedBy: session.user.id
      });
      await defaultSettings.save();
      
      settings = await Settings.findById(defaultSettings._id)
        .populate('updatedBy', 'name email')
        .lean();
    }

    return NextResponse.json({
      settings,
      message: 'Настройки загружены успешно'
    });
  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - обновление настроек
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Валидация входных данных
    const allowedFields = [
      'siteName', 'siteDescription', 'siteUrl', 'adminEmail', 'supportEmail',
      'enableTwoFactor', 'sessionTimeout', 'maxLoginAttempts', 'passwordMinLength', 'requirePasswordChange',
      'enableEmailNotifications', 'enablePushNotifications', 'notificationFrequency',
      'cacheEnabled', 'cacheTtl', 'enableCompression', 'maxFileSize',
      'paymentProvider', 'enableAnalytics', 'analyticsProvider',
      'primaryColor',
      'defaultLanguage', 'enableMultiLanguage', 'moderationEnabled', 'autoPublish'
    ];
    
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    // Добавляем информацию о том, кто обновил
    updateData.updatedBy = session.user.id;
    updateData.lastUpdated = new Date();

    await dbConnect();

    // Обновляем или создаем настройки
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(updateData);
    } else {
      Object.assign(settings, updateData);
    }
    
    await settings.save();
    
    // Получаем обновленные настройки с информацией об авторе
    const updatedSettings = await Settings.findById(settings._id)
      .populate('updatedBy', 'name email')
      .lean();

    return NextResponse.json({
      settings: updatedSettings,
      message: 'Настройки обновлены успешно'
    });
  } catch (error) {
    console.error('Ошибка обновления настроек:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - сброс настроек к значениям по умолчанию
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

    // Удаляем существующие настройки
    await Settings.deleteMany({});
    
    // Создаем новые настройки по умолчанию
    const defaultSettings = new Settings({
      updatedBy: session.user.id
    });
    await defaultSettings.save();
    
    // Получаем созданные настройки
    const settings = await Settings.findById(defaultSettings._id)
      .populate('updatedBy', 'name email')
      .lean();

    return NextResponse.json({
      settings,
      message: 'Настройки сброшены к значениям по умолчанию'
    });
  } catch (error) {
    console.error('Ошибка сброса настроек:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}