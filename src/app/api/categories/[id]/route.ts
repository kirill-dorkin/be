import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import Service from '@/models/Service';
import mongoose from 'mongoose';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Получить категорию по ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Неверный ID категории' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeServices = searchParams.get('includeServices') === 'true';
    const includeStats = searchParams.get('includeStats') === 'true';

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }

    let result: any = { ...category };

    // Добавление услуг категории
    if (includeServices) {
      const services = await Service.find({ category: id })
        .select('name cost duration')
        .lean();
      result.services = services;
    }

    // Добавление статистики
    if (includeStats) {
      const serviceCount = await Service.countDocuments({ category: id });
      const serviceStats = await Service.aggregate([
        { $match: { category: new mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: null,
            averageCost: { $avg: '$cost' },
            minCost: { $min: '$cost' },
            maxCost: { $max: '$cost' },
            totalRevenue: { $sum: '$cost' },
            averageDuration: { $avg: '$duration' }
          }
        }
      ]);

      result.stats = {
        serviceCount,
        averageCost: serviceStats[0]?.averageCost || 0,
        minCost: serviceStats[0]?.minCost || 0,
        maxCost: serviceStats[0]?.maxCost || 0,
        totalRevenue: serviceStats[0]?.totalRevenue || 0,
        averageDuration: serviceStats[0]?.averageDuration || 0
      };
    }

    return NextResponse.json({
      success: true,
      category: result
    });
  } catch (error) {
    console.error('Ошибка при получении категории:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - Обновить категорию
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'worker')) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Неверный ID категории' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    // Валидация
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Название категории не может быть пустым' },
        { status: 400 }
      );
    }

    // Проверка существования категории
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }

    // Проверка уникальности названия
    if (name.trim() !== existingCategory.name) {
      const duplicateCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Категория с таким названием уже существует' },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { 
        name: name.trim(),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      category: updatedCategory,
      message: 'Категория успешно обновлена'
    });
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить категорию
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Неверный ID категории' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }

    // Проверка на наличие связанных услуг
    const serviceCount = await Service.countDocuments({ category: id });
    
    if (serviceCount > 0 && !force) {
      return NextResponse.json({
        error: 'Невозможно удалить категорию с привязанными услугами',
        serviceCount,
        suggestion: 'Используйте параметр force=true для принудительного удаления'
      }, { status: 409 });
    }

    // Принудительное удаление - сначала удаляем все связанные услуги
    if (force && serviceCount > 0) {
      await Service.deleteMany({ category: id });
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Категория успешно удалена${force && serviceCount > 0 ? ` вместе с ${serviceCount} услугами` : ''}`
    });
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}