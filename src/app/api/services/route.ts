import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import Service, { IService } from '@/models/Service';
import Category from '@/models/Category';
import mongoose from 'mongoose';

// GET - Получить все услуги
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Построение фильтра
    interface ServiceFilter {
      category?: string;
      $or?: Array<{
        name?: { $regex: string; $options: string };
      }>;
    }
    
    const filter: ServiceFilter = {};
    
    if (categoryId && categoryId !== 'all') {
      filter.category = categoryId;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Подсчет общего количества
    const totalCount = await Service.countDocuments(filter);
    
    // Получение услуг с пагинацией
    const services = await Service.find(filter)
      .populate('category', 'name')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Статистика
    const stats = await Service.aggregate([
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          averageCost: { $avg: '$cost' },
          minCost: { $min: '$cost' },
          maxCost: { $max: '$cost' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      services,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      },
      stats: stats[0] || {
        totalServices: 0,
        averageCost: 0,
        minCost: 0,
        maxCost: 0
      }
    });
  } catch (error) {
    console.error('Ошибка при получении услуг:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - Создать новую услугу
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'worker')) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name, cost, duration, category } = body;

    // Валидация
    if (!name || !cost || !category) {
      return NextResponse.json(
        { error: 'Название, стоимость и категория обязательны' },
        { status: 400 }
      );
    }

    if (cost < 0) {
      return NextResponse.json(
        { error: 'Стоимость не может быть отрицательной' },
        { status: 400 }
      );
    }

    // Проверка существования категории
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json(
        { error: 'Неверный ID категории' },
        { status: 400 }
      );
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }

    // Проверка уникальности названия в рамках категории
    const existingService = await Service.findOne({ name, category });
    if (existingService) {
      return NextResponse.json(
        { error: 'Услуга с таким названием уже существует в данной категории' },
        { status: 409 }
      );
    }

    const newService = new Service({
      name,
      cost,
      duration,
      category
    });

    await newService.save();
    await newService.populate('category', 'name');

    return NextResponse.json({
      success: true,
      service: newService,
      message: 'Услуга успешно создана'
    }, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании услуги:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - Массовое обновление услуг
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { action, serviceIds, updateData } = body;

    if (!action || !serviceIds || !Array.isArray(serviceIds)) {
      return NextResponse.json(
        { error: 'Неверные параметры запроса' },
        { status: 400 }
      );
    }

    let result;
    
    switch (action) {
      case 'updatePrices':
        if (!updateData.priceMultiplier) {
          return NextResponse.json(
            { error: 'Множитель цены обязателен' },
            { status: 400 }
          );
        }
        
        result = await Service.updateMany(
          { _id: { $in: serviceIds } },
          { $mul: { cost: updateData.priceMultiplier } }
        );
        break;
        
      case 'updateCategory':
        if (!updateData.categoryId) {
          return NextResponse.json(
            { error: 'ID категории обязателен' },
            { status: 400 }
          );
        }
        
        result = await Service.updateMany(
          { _id: { $in: serviceIds } },
          { category: updateData.categoryId }
        );
        break;
        
      default:
        return NextResponse.json(
          { error: 'Неизвестное действие' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Обновлено ${result.modifiedCount} услуг`
    });
  } catch (error) {
    console.error('Ошибка при массовом обновлении услуг:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - Массовое удаление услуг
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json(
        { error: 'ID услуг не указаны' },
        { status: 400 }
      );
    }

    const serviceIds = idsParam.split(',');
    
    // Проверка валидности ID
    const invalidIds = serviceIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Неверные ID: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await Service.deleteMany({
      _id: { $in: serviceIds }
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Удалено ${result.deletedCount} услуг`
    });
  } catch (error) {
    console.error('Ошибка при удалении услуг:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}