import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/dbConnect';
import { authOptions } from '@/auth';
import mongoose from 'mongoose';

// Используем ту же модель, что и в основном роуте
const ContentPageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  metaDescription: { type: String },
  metaKeywords: { type: String },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  isPublic: { type: Boolean, default: true },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  tags: [{ type: String }],
  featuredImage: { type: String },
  template: { 
    type: String, 
    enum: ['default', 'landing', 'blog', 'custom'], 
    default: 'default' 
  },
  views: { type: Number, default: 0 },
  publishedAt: { type: Date },
}, {
  timestamps: true
});

ContentPageSchema.pre('save', function(next) {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const ContentPage = mongoose.models.ContentPage || mongoose.model('ContentPage', ContentPageSchema);

// POST - массовые операции
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, pageIds, data } = body;

    // Валидация входных данных
    if (!action || !Array.isArray(pageIds) || pageIds.length === 0) {
      return NextResponse.json(
        { error: 'Действие и список ID страниц обязательны' },
        { status: 400 }
      );
    }

    await dbConnect();

    let result;
    let message = '';

    switch (action) {
      case 'delete':
        // Массовое удаление
        result = await ContentPage.deleteMany({
          _id: { $in: pageIds }
        });
        message = `Удалено ${result.deletedCount} страниц`;
        break;

      case 'publish':
        // Массовая публикация
        result = await ContentPage.updateMany(
          { _id: { $in: pageIds } },
          { 
            status: 'published',
            publishedAt: new Date()
          }
        );
        message = `Опубликовано ${result.modifiedCount} страниц`;
        break;

      case 'unpublish':
        // Массовое снятие с публикации
        result = await ContentPage.updateMany(
          { _id: { $in: pageIds } },
          { status: 'draft' }
        );
        message = `Сняты с публикации ${result.modifiedCount} страниц`;
        break;

      case 'archive':
        // Массовое архивирование
        result = await ContentPage.updateMany(
          { _id: { $in: pageIds } },
          { status: 'archived' }
        );
        message = `Архивировано ${result.modifiedCount} страниц`;
        break;

      case 'updateStatus':
        // Обновление статуса
        if (!data?.status || !['draft', 'published', 'archived'].includes(data.status)) {
          return NextResponse.json(
            { error: 'Некорректный статус' },
            { status: 400 }
          );
        }
        
        const updateData: any = { status: data.status };
        if (data.status === 'published') {
          updateData.publishedAt = new Date();
        }
        
        result = await ContentPage.updateMany(
          { _id: { $in: pageIds } },
          updateData
        );
        message = `Обновлен статус у ${result.modifiedCount} страниц`;
        break;

      case 'updateVisibility':
        // Обновление видимости
        if (data?.isPublic === undefined) {
          return NextResponse.json(
            { error: 'Параметр видимости обязателен' },
            { status: 400 }
          );
        }
        
        result = await ContentPage.updateMany(
          { _id: { $in: pageIds } },
          { isPublic: data.isPublic }
        );
        message = `Обновлена видимость у ${result.modifiedCount} страниц`;
        break;

      case 'addTags':
        // Добавление тегов
        if (!data?.tags || !Array.isArray(data.tags)) {
          return NextResponse.json(
            { error: 'Список тегов обязателен' },
            { status: 400 }
          );
        }
        
        result = await ContentPage.updateMany(
          { _id: { $in: pageIds } },
          { $addToSet: { tags: { $each: data.tags } } }
        );
        message = `Добавлены теги к ${result.modifiedCount} страницам`;
        break;

      case 'removeTags':
        // Удаление тегов
        if (!data?.tags || !Array.isArray(data.tags)) {
          return NextResponse.json(
            { error: 'Список тегов обязателен' },
            { status: 400 }
          );
        }
        
        result = await ContentPage.updateMany(
          { _id: { $in: pageIds } },
          { $pullAll: { tags: data.tags } }
        );
        message = `Удалены теги у ${result.modifiedCount} страниц`;
        break;

      case 'updateTemplate':
        // Обновление шаблона
        if (!data?.template || !['default', 'landing', 'blog', 'custom'].includes(data.template)) {
          return NextResponse.json(
            { error: 'Некорректный шаблон' },
            { status: 400 }
          );
        }
        
        result = await ContentPage.updateMany(
          { _id: { $in: pageIds } },
          { template: data.template }
        );
        message = `Обновлен шаблон у ${result.modifiedCount} страниц`;
        break;

      default:
        return NextResponse.json(
          { error: 'Неподдерживаемое действие' },
          { status: 400 }
        );
    }

    // Получаем обновленную статистику
    const stats = await ContentPage.aggregate([
      {
        $group: {
          _id: null,
          totalPages: { $sum: 1 },
          publishedPages: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          draftPages: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          archivedPages: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    return NextResponse.json({
      message,
      result,
      stats: stats[0] || {
        totalPages: 0,
        publishedPages: 0,
        draftPages: 0,
        archivedPages: 0,
        totalViews: 0
      }
    });
  } catch (error) {
    console.error('Ошибка массовой операции:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}