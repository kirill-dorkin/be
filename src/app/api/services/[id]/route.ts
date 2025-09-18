import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import Service from '@/models/Service';
import Category from '@/models/Category';
import mongoose from 'mongoose';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Получить услугу по ID
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
        { error: 'Неверный ID услуги' },
        { status: 400 }
      );
    }

    const service = await Service.findById(id)
      .populate('category', 'name')
      .lean();

    if (!service) {
      return NextResponse.json(
        { error: 'Услуга не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Ошибка при получении услуги:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - Обновить услугу
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
        { error: 'Неверный ID услуги' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, cost, duration, category } = body;

    // Валидация
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: 'Название не может быть пустым' },
        { status: 400 }
      );
    }

    if (cost !== undefined && cost < 0) {
      return NextResponse.json(
        { error: 'Стоимость не может быть отрицательной' },
        { status: 400 }
      );
    }

    // Проверка существования услуги
    const existingService = await Service.findById(id);
    if (!existingService) {
      return NextResponse.json(
        { error: 'Услуга не найдена' },
        { status: 404 }
      );
    }

    // Проверка категории, если она обновляется
    if (category && category !== existingService.category.toString()) {
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
    }

    // Проверка уникальности названия в рамках категории
    if (name && name !== existingService.name) {
      const targetCategory = category || existingService.category;
      const duplicateService = await Service.findOne({
        name,
        category: targetCategory,
        _id: { $ne: id }
      });
      
      if (duplicateService) {
        return NextResponse.json(
          { error: 'Услуга с таким названием уже существует в данной категории' },
          { status: 409 }
        );
      }
    }

    // Подготовка данных для обновления
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (cost !== undefined) updateData.cost = cost;
    if (duration !== undefined) updateData.duration = duration;
    if (category !== undefined) updateData.category = category;
    updateData.updatedAt = new Date();

    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    return NextResponse.json({
      success: true,
      service: updatedService,
      message: 'Услуга успешно обновлена'
    });
  } catch (error) {
    console.error('Ошибка при обновлении услуги:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить услугу
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
        { error: 'Неверный ID услуги' },
        { status: 400 }
      );
    }

    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json(
        { error: 'Услуга не найдена' },
        { status: 404 }
      );
    }

    await Service.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Услуга успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка при удалении услуги:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}