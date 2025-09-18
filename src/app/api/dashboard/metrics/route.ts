import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { auth } from '@/lib/auth';
import { optimizedDb } from '@/lib/optimizedDb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // дни
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Используем оптимизированные агрегации с кэшированием
    const [totalOrders, totalRevenue, totalUsers, totalProducts, recentOrders] = await Promise.all([
      optimizedDb.aggregate(Order, [
        { $match: { createdAt: { $gte: startDate } } },
        { $count: 'total' }
      ], `orders_count_${period}d`),
      
      optimizedDb.aggregate(Order, [
        { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ], `revenue_${period}d`),
      
      optimizedDb.aggregate(User, [
        { $match: { createdAt: { $gte: startDate } } },
        { $count: 'total' }
      ], `users_count_${period}d`),
      
      optimizedDb.findWithCache(Product, {}, `products_count`, 300),
      
      optimizedDb.findWithPagination(Order, 
        { createdAt: { $gte: startDate } },
        { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }
      )
    ]);

    // Статистика по дням с кэшированием
    const dailyStats = await optimizedDb.aggregate(Order, [
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$total', 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ], `daily_stats_${period}d`);

    return NextResponse.json({
      metrics: {
        totalOrders: totalOrders[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers: totalUsers[0]?.total || 0,
        totalProducts: Array.isArray(totalProducts) ? totalProducts.length : 0,
        period: parseInt(period)
      },
      dailyStats,
      recentOrders: recentOrders.data
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}