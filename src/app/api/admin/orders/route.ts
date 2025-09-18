import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// GET - Получить все заказы для административной панели
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // pending, processing, shipped, delivered, cancelled
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const userId = searchParams.get('userId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Построение фильтра
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    
    if (minAmount || maxAmount) {
      filter.totalAmount = {};
      if (minAmount) filter.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.totalAmount.$lte = parseFloat(maxAmount);
    }
    
    if (userId) {
      filter.userId = userId;
    }

    const totalCount = await Order.countDocuments(filter);
    
    const orders = await Order.find(filter)
      .populate({
        path: 'userId',
        model: User,
        select: 'name email phone'
      })
      .populate({
        path: 'items.productId',
        model: Product,
        select: 'name price images'
      })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Статистика заказов
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Статистика по периодам
    const periodStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          dailyOrders: { $sum: 1 },
          dailyRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      },
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      },
      periodStats
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Создать новый заказ (для админа)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      userId,
      items,
      shippingAddress,
      paymentMethod,
      notes
    } = body;

    // Валидация
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Проверка существования пользователя
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Проверка товаров и расчет суммы
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Создание заказа
    const order = new Order({
      userId,
      items: validatedItems,
      totalAmount,
      status: 'pending',
      shippingAddress,
      paymentMethod,
      notes,
      createdBy: session.user.id
    });

    await order.save();

    // Популяция данных для ответа
    await order.populate([
      {
        path: 'userId',
        model: User,
        select: 'name email phone'
      },
      {
        path: 'items.productId',
        model: Product,
        select: 'name price images'
      }
    ]);

    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}