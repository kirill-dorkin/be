import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';
import mongoose from 'mongoose';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Получение продукта по ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'worker')) {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Неверный ID продукта' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id)
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Продукт не найден' },
        { status: 404 }
      );
    }

    // Получение связанных продуктов из той же категории
    const relatedProducts = await Product.find({
      category: (product as any).category,
      _id: { $ne: (product as any)._id }
    })
      .select('name price images inStock')
      .limit(5)
      .lean();

    // Статистика продукта (если есть заказы)
    const productStats = await Product.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
      {
        $lookup: {
          from: 'orders',
          let: { productId: '$_id' },
          pipeline: [
            {
              $unwind: '$items'
            },
            {
              $match: {
                $expr: {
                  $eq: ['$items.product', '$$productId']
                }
              }
            },
            {
              $group: {
                _id: null,
                totalSold: { $sum: '$items.quantity' },
                totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                orderCount: { $sum: 1 }
              }
            }
          ],
          as: 'salesStats'
        }
      }
    ]);

    const stats = productStats[0]?.salesStats[0] || {
      totalSold: 0,
      totalRevenue: 0,
      orderCount: 0
    };

    return NextResponse.json({
      success: true,
      product,
      relatedProducts,
      stats
    });

  } catch (error) {
    console.error('Ошибка при получении продукта:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - Обновление продукта
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Неверный ID продукта' },
        { status: 400 }
      );
    }

    const { name, description, price, category, stock, images, specifications, tags } = body;

    // Проверка существования продукта
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Продукт не найден' },
        { status: 404 }
      );
    }

    // Проверка уникальности названия (если изменяется)
    if (name && name !== existingProduct.name) {
      const duplicateProduct = await Product.findOne({ name, _id: { $ne: id } });
      if (duplicateProduct) {
        return NextResponse.json(
          { success: false, error: 'Продукт с таким названием уже существует' },
          { status: 400 }
        );
      }
    }

    // Проверка существования категории (если изменяется)
    if (category && category !== existingProduct.category?.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return NextResponse.json(
          { success: false, error: 'Категория не найдена' },
          { status: 400 }
        );
      }
    }

    // Подготовка данных для обновления
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (stock !== undefined) {
      updateData.stock = parseInt(stock);
      updateData.inStock = parseInt(stock) > 0;
    }
    if (images !== undefined) updateData.images = images;
    if (specifications !== undefined) updateData.specifications = specifications;
    if (tags !== undefined) updateData.tags = tags;

    // Обновление продукта
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name description');

    return NextResponse.json({
      success: true,
      message: 'Продукт успешно обновлен',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Ошибка при обновлении продукта:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - Удаление продукта
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Неверный ID продукта' },
        { status: 400 }
      );
    }

    // Проверка существования продукта
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Продукт не найден' },
        { status: 404 }
      );
    }

    // Проверка наличия активных заказов с этим продуктом
    const activeOrders = await mongoose.connection.db?.collection('orders').findOne({
      'items.product': new mongoose.Types.ObjectId(id),
      status: { $in: ['pending', 'processing', 'shipped'] }
    });

    if (activeOrders) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Нельзя удалить продукт, который есть в активных заказах. Сначала завершите все заказы с этим продуктом.' 
        },
        { status: 400 }
      );
    }

    // Удаление продукта
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Продукт успешно удален'
    });

  } catch (error) {
    console.error('Ошибка при удалении продукта:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}