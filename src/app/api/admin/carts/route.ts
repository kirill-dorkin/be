import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Cart from '@/models/Cart';
import User from '@/models/User';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// GET - Получить все корзины для административной панели
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
    const status = searchParams.get('status'); // active, abandoned, empty
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    // Построение фильтра
    const filter: any = {};
    
    if (status === 'active') {
      filter.items = { $exists: true, $not: { $size: 0 } };
      filter.updatedAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }; // активные за последнюю неделю
    } else if (status === 'abandoned') {
      filter.items = { $exists: true, $not: { $size: 0 } };
      filter.updatedAt = { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }; // заброшенные более недели
    } else if (status === 'empty') {
      filter.$or = [
        { items: { $size: 0 } },
        { items: { $exists: false } }
      ];
    }

    if (minAmount) {
      filter.totalAmount = { ...filter.totalAmount, $gte: parseFloat(minAmount) };
    }
    if (maxAmount) {
      filter.totalAmount = { ...filter.totalAmount, $lte: parseFloat(maxAmount) };
    }

    const totalCount = await Cart.countDocuments(filter);
    
    const carts = await Cart.find(filter)
      .populate({
        path: 'userId',
        model: User,
        select: 'name email'
      })
      .populate({
        path: 'items.productId',
        model: Product,
        select: 'name price images'
      })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Статистика корзин
    const stats = await Cart.aggregate([
      {
        $group: {
          _id: null,
          totalCarts: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' },
          averageValue: { $avg: '$totalAmount' },
          activeCarts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: [{ $size: '$items' }, 0] },
                    { $gte: ['$updatedAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] }
                  ]
                },
                1,
                0
              ]
            }
          },
          abandonedCarts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: [{ $size: '$items' }, 0] },
                    { $lt: ['$updatedAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      carts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      },
      stats: stats[0] || {
        totalCarts: 0,
        totalValue: 0,
        averageValue: 0,
        activeCarts: 0,
        abandonedCarts: 0
      }
    });
  } catch (error) {
    console.error('Error fetching carts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Очистить неактивные корзины
export async function DELETE(request: NextRequest) {
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
    const { type, daysOld } = body; // type: 'empty' | 'abandoned', daysOld: number

    let filter: any = {};
    
    if (type === 'empty') {
      filter = {
        $or: [
          { items: { $size: 0 } },
          { items: { $exists: false } }
        ]
      };
    } else if (type === 'abandoned') {
      const cutoffDate = new Date(Date.now() - (daysOld || 30) * 24 * 60 * 60 * 1000);
      filter = {
        items: { $exists: true, $not: { $size: 0 } },
        updatedAt: { $lt: cutoffDate }
      };
    }

    const result = await Cart.deleteMany(filter);

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Удалено ${result.deletedCount} корзин`
    });
  } catch (error) {
    console.error('Error cleaning carts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}