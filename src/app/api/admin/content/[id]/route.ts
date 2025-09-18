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

// GET - получение конкретной страницы
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const page = await ContentPage.findById(params.id)
      .populate('author', 'name email')
      .lean();

    if (!page) {
      return NextResponse.json(
        { error: 'Страница не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Ошибка получения страницы:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - обновление страницы
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Проверяем существование страницы
    const existingPage = await ContentPage.findById(params.id);
    if (!existingPage) {
      return NextResponse.json(
        { error: 'Страница не найдена' },
        { status: 404 }
      );
    }

    // Проверяем уникальность slug (исключая текущую страницу)
    const duplicateSlug = await ContentPage.findOne({ 
      slug, 
      _id: { $ne: params.id } 
    });
    if (duplicateSlug) {
      return NextResponse.json(
        { error: 'Страница с таким slug уже существует' },
        { status: 400 }
      );
    }

    // Обновляем страницу
    const updatedPage = await ContentPage.findByIdAndUpdate(
      params.id,
      {
        title,
        slug,
        content,
        metaDescription,
        metaKeywords,
        status,
        isPublic,
        tags: tags || [],
        featuredImage,
        template
      },
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Ошибка обновления страницы:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - удаление страницы
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Проверяем существование страницы
    const page = await ContentPage.findById(params.id);
    if (!page) {
      return NextResponse.json(
        { error: 'Страница не найдена' },
        { status: 404 }
      );
    }

    // Удаляем страницу
    await ContentPage.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'Страница успешно удалена' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка удаления страницы:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}