import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import Service from '@/models/Service';
import mongoose from 'mongoose';

// GET - Получить все категории
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
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const includeStats = searchParams.get('includeStats') === 'true';

    // Построение фильтра
    interface CategoryFilter {
      $or?: Array<{
        name?: { $regex: string; $options: string };
      }>;
    }
    
    const filter: CategoryFilter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Подсчет общего количества
    const totalCount = await Category.countDocuments(filter);
    
    // Получение категорий с пагинацией
    let categories = await Category.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Добавление статистики по услугам для каждой категории
    if (includeStats) {
      const categoriesWithStats = await Promise.all(
        categories.map(async (category) => {
          const serviceCount = await Service.countDocuments({ category: category._id });
          const serviceStats = await Service.aggregate([
            { $match: { category: category._id } },
            {
              $group: {
                _id: null,
                averageCost: { $avg: '$cost' },
                minCost: { $min: '$cost' },
                maxCost: { $max: '$cost' },
                totalRevenue: { $sum: '$cost' }
              }
            }
          ]);

          return {
            ...category,
            stats: {
              serviceCount,
              averageCost: serviceStats[0]?.averageCost || 0,
              minCost: serviceStats[0]?.minCost || 0,
              maxCost: serviceStats[0]?.maxCost || 0,
              totalRevenue: serviceStats[0]?.totalRevenue || 0
            }
          };
        })
      );
      categories = categoriesWithStats;
    }

    // Общая статистика
    const totalStats = await Category.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: 'category',
          as: 'services'
        }
      },
      {
        $group: {
          _id: null,
          totalCategories: { $sum: 1 },
          categoriesWithServices: {
            $sum: {
              $cond: [{ $gt: [{ $size: '$services' }, 0] }, 1, 0]
            }
          },
          categoriesWithoutServices: {
            $sum: {
              $cond: [{ $eq: [{ $size: '$services' }, 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      categories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      },
      stats: totalStats[0] || {
        totalCategories: 0,
        categoriesWithServices: 0,
        categoriesWithoutServices: 0
      }
    });
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - Создать новую категорию
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
    const { name } = body;

    // Валидация
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Название категории обязательно' },
        { status: 400 }
      );
    }

    // Проверка уникальности названия
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Категория с таким названием уже существует' },
        { status: 409 }
      );
    }

    const newCategory = new Category({
      name: name.trim()
    });

    await newCategory.save();

    return NextResponse.json({
      success: true,
      category: newCategory,
      message: 'Категория успешно создана'
    }, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - Массовое удаление категорий
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
    const force = searchParams.get('force') === 'true';
    
    if (!idsParam) {
      return NextResponse.json(
        { error: 'ID категорий не указаны' },
        { status: 400 }
      );
    }

    const categoryIds = idsParam.split(',');
    
    // Проверка валидности ID
    const invalidIds = categoryIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Неверные ID: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Проверка на наличие связанных услуг
    if (!force) {
      const categoriesWithServices = await Service.distinct('category', {
        category: { $in: categoryIds }
      });
      
      if (categoriesWithServices.length > 0) {
        const categoryNames = await Category.find({
          _id: { $in: categoriesWithServices }
        }).select('name');
        
        return NextResponse.json({
          error: 'Невозможно удалить категории с привязанными услугами',
          categoriesWithServices: categoryNames.map(cat => cat.name),
          suggestion: 'Используйте параметр force=true для принудительного удаления'
        }, { status: 409 });
      }
    } else {
      // Принудительное удаление - сначала удаляем все связанные услуги
      await Service.deleteMany({ category: { $in: categoryIds } });
    }

    const result = await Category.deleteMany({
      _id: { $in: categoryIds }
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Удалено ${result.deletedCount} категорий${force ? ' и связанных услуг' : ''}`
    });
  } catch (error) {
    console.error('Ошибка при удалении категорий:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}