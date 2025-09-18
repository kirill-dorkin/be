import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/dbConnect';
import { authOptions } from '@/auth';
import mongoose from 'mongoose';

// Модель для контента
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

// Автоматически устанавливаем publishedAt при публикации
ContentPageSchema.pre('save', function(next) {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const ContentPage = mongoose.models.ContentPage || mongoose.model('ContentPage', ContentPageSchema);

// GET - получение всех страниц с статистикой
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

    // Получаем все страницы с информацией об авторе
    const pages = await ContentPage.find({})
      .populate('author', 'name email')
      .sort({ updatedAt: -1 })
      .lean();

    // Вычисляем статистику
    const stats = {
      totalPages: pages.length,
      publishedPages: pages.filter(p => p.status === 'published').length,
      draftPages: pages.filter(p => p.status === 'draft').length,
      archivedPages: pages.filter(p => p.status === 'archived').length,
      totalViews: pages.reduce((sum, p) => sum + (p.views || 0), 0)
    };

    return NextResponse.json({
      pages,
      stats
    });
  } catch (error) {
    console.error('Ошибка получения страниц:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - создание новой страницы
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
    const {
      title,
      slug,
      content,
      metaDescription,
      metaKeywords,
      status,
      isPublic,
      tags,
      featuredImage,
      template
    } = body;

    // Валидация обязательных полей
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Название, slug и контент обязательны' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Проверяем уникальность slug
    const existingPage = await ContentPage.findOne({ slug });
    if (existingPage) {
      return NextResponse.json(
        { error: 'Страница с таким slug уже существует' },
        { status: 400 }
      );
    }

    // Создаем новую страницу
    const newPage = new ContentPage({
      title,
      slug,
      content,
      metaDescription,
      metaKeywords,
      status: status || 'draft',
      isPublic: isPublic !== undefined ? isPublic : true,
      author: session.user.id,
      tags: tags || [],
      featuredImage,
      template: template || 'default'
    });

    await newPage.save();
    
    // Получаем созданную страницу с информацией об авторе
    const populatedPage = await ContentPage.findById(newPage._id)
      .populate('author', 'name email')
      .lean();

    return NextResponse.json(populatedPage, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания страницы:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}