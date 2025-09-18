import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';
import mongoose from 'mongoose';

interface ProductFilter {
  $or?: Array<{
    name?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
  }>;
  category?: string;
  price?: {
    $gte?: number;
    $lte?: number;
  };
  inStock?: boolean;
}

// GET - Получение продуктов с фильтрацией и пагинацией
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'worker')) {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Построение фильтра
    const filter: ProductFilter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (inStock !== null && inStock !== '') {
      filter.inStock = inStock === 'true';
    }

    // Подсчет общего количества
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Получение продуктов
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Статистика по категориям
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $project: {
          name: '$categoryInfo.name',
          count: 1,
          totalValue: 1
        }
      }
    ]);

    // Общая статистика
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          averagePrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' },
          inStockCount: {
            $sum: {
              $cond: [{ $gt: ['$stock', 0] }, 1, 0]
            }
          },
          outOfStockCount: {
            $sum: {
              $cond: [{ $eq: ['$stock', 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      },
      stats: stats[0] || {
        totalProducts: 0,
        totalValue: 0,
        averagePrice: 0,
        totalStock: 0,
        inStockCount: 0,
        outOfStockCount: 0
      },
      categoryStats
    });

  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - Создание нового продукта
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name, description, price, category, stock, images, specifications, tags } = body;

    // Валидация обязательных полей
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Заполните все обязательные поля' },
        { status: 400 }
      );
    }

    // Проверка существования категории
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, error: 'Категория не найдена' },
        { status: 400 }
      );
    }

    // Проверка уникальности названия
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Продукт с таким названием уже существует' },
        { status: 400 }
      );
    }

    // Создание продукта
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock) || 0,
      images: images || [],
      specifications: specifications || {},
      tags: tags || [],
      inStock: parseInt(stock) > 0,
      createdBy: session.user.id
    });

    await product.save();
    await product.populate('category', 'name');

    return NextResponse.json({
      success: true,
      message: 'Продукт успешно создан',
      product
    });

  } catch (error) {
    console.error('Ошибка при создании продукта:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - Массовые операции с продуктами
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { action, productIds, data } = body;

    if (!action || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { success: false, error: 'Неверные параметры запроса' },
        { status: 400 }
      );
    }

    let result;
    let message = '';

    switch (action) {
      case 'bulkDelete':
        result = await Product.deleteMany({
          _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) }
        });
        message = `Удалено продуктов: ${result.deletedCount}`;
        break;

      case 'bulkCategoryUpdate':
        if (!data?.newCategory) {
          return NextResponse.json(
            { success: false, error: 'Не указана новая категория' },
            { status: 400 }
          );
        }
        
        // Проверка существования категории
        const categoryExists = await Category.findById(data.newCategory);
        if (!categoryExists) {
          return NextResponse.json(
            { success: false, error: 'Категория не найдена' },
            { status: 400 }
          );
        }

        result = await Product.updateMany(
          { _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) } },
          { 
            $set: { 
              category: data.newCategory,
              updatedAt: new Date()
            }
          }
        );
        message = `Обновлено продуктов: ${result.modifiedCount}`;
        break;

      case 'bulkPriceUpdate':
        if (!data?.priceChange || !data?.changeType) {
          return NextResponse.json(
            { success: false, error: 'Не указаны параметры изменения цены' },
            { status: 400 }
          );
        }

        const priceChange = parseFloat(data.priceChange);
        let updateQuery;

        if (data.changeType === 'percentage') {
          updateQuery = {
            $mul: { price: 1 + (priceChange / 100) },
            $set: { updatedAt: new Date() }
          };
        } else {
          updateQuery = {
            $inc: { price: priceChange },
            $set: { updatedAt: new Date() }
          };
        }

        result = await Product.updateMany(
          { _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) } },
          updateQuery
        );
        message = `Обновлено цен: ${result.modifiedCount}`;
        break;

      case 'bulkStockUpdate':
        if (!data?.stockChange || !data?.changeType) {
          return NextResponse.json(
            { success: false, error: 'Не указаны параметры изменения запасов' },
            { status: 400 }
          );
        }

        const stockChange = parseInt(data.stockChange);
        let stockUpdateQuery;

        if (data.changeType === 'set') {
          stockUpdateQuery = {
            $set: { 
              stock: stockChange,
              inStock: stockChange > 0,
              updatedAt: new Date()
            }
          };
        } else {
          stockUpdateQuery = [
            {
              $set: {
                stock: {
                  $max: [0, { $add: ['$stock', stockChange] }]
                },
                updatedAt: new Date()
              }
            },
            {
              $set: {
                inStock: { $gt: ['$stock', 0] }
              }
            }
          ];
        }

        result = await Product.updateMany(
          { _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) } },
          stockUpdateQuery
        );
        message = `Обновлено запасов: ${result.modifiedCount}`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Неизвестное действие' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message,
      result
    });

  } catch (error) {
    console.error('Ошибка при выполнении массовой операции:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}