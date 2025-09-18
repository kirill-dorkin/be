import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import Cart from '@/models/Cart';
import Favorite from '@/models/Favorite';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// GET - Получить аналитику для административной панели
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
    const period = parseInt(searchParams.get('period') || '30'); // дни
    const type = searchParams.get('type') || 'overview'; // overview, sales, users, products, tasks

    const periodDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
    const previousPeriodDate = new Date(Date.now() - period * 2 * 24 * 60 * 60 * 1000);

    if (type === 'overview') {
      // Общая аналитика
      const [orderStats, userStats, productStats, taskStats] = await Promise.all([
        // Статистика заказов
        Order.aggregate([
          {
            $facet: {
              current: [
                { $match: { createdAt: { $gte: periodDate } } },
                {
                  $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' }
                  }
                }
              ],
              previous: [
                {
                  $match: {
                    createdAt: {
                      $gte: previousPeriodDate,
                      $lt: periodDate
                    }
                  }
                },
                {
                  $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' }
                  }
                }
              ],
              statusBreakdown: [
                { $match: { createdAt: { $gte: periodDate } } },
                {
                  $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                  }
                }
              ]
            }
          }
        ]),

        // Статистика пользователей
        User.aggregate([
          {
            $facet: {
              current: [
                { $match: { createdAt: { $gte: periodDate } } },
                {
                  $group: {
                    _id: null,
                    newUsers: { $sum: 1 },
                    activeUsers: {
                      $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                    }
                  }
                }
              ],
              previous: [
                {
                  $match: {
                    createdAt: {
                      $gte: previousPeriodDate,
                      $lt: periodDate
                    }
                  }
                },
                {
                  $group: {
                    _id: null,
                    newUsers: { $sum: 1 },
                    activeUsers: {
                      $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                    }
                  }
                }
              ],
              roleBreakdown: [
                {
                  $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                  }
                }
              ]
            }
          }
        ]),

        // Статистика товаров
        Product.aggregate([
          {
            $facet: {
              current: [
                { $match: { createdAt: { $gte: periodDate } } },
                {
                  $group: {
                    _id: null,
                    newProducts: { $sum: 1 }
                  }
                }
              ],
              previous: [
                {
                  $match: {
                    createdAt: {
                      $gte: previousPeriodDate,
                      $lt: periodDate
                    }
                  }
                },
                {
                  $group: {
                    _id: null,
                    newProducts: { $sum: 1 }
                  }
                }
              ],
              categoryBreakdown: [
                {
                  $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    averagePrice: { $avg: '$price' }
                  }
                }
              ]
            }
          }
        ]),

        // Статистика задач
        Task.aggregate([
          {
            $facet: {
              current: [
                { $match: { createdAt: { $gte: periodDate } } },
                {
                  $group: {
                    _id: null,
                    newTasks: { $sum: 1 },
                    completedTasks: {
                      $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                  }
                }
              ],
              statusBreakdown: [
                {
                  $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                  }
                }
              ],
              priorityBreakdown: [
                {
                  $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                  }
                }
              ]
            }
          }
        ])
      ]);

      // Дополнительная статистика корзин и избранного
      const [cartStats, favoriteStats] = await Promise.all([
        Cart.aggregate([
          {
            $group: {
              _id: null,
              totalCarts: { $sum: 1 },
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
              averageCartValue: { $avg: '$totalAmount' }
            }
          }
        ]),
        
        Favorite.aggregate([
          {
            $match: {
              addedAt: { $gte: periodDate }
            }
          },
          {
            $group: {
              _id: null,
              totalFavorites: { $sum: 1 },
              uniqueUsers: { $addToSet: '$userId' },
              uniqueProducts: { $addToSet: '$productId' }
            }
          },
          {
            $project: {
              totalFavorites: 1,
              uniqueUsers: { $size: '$uniqueUsers' },
              uniqueProducts: { $size: '$uniqueProducts' }
            }
          }
        ])
      ]);

      return NextResponse.json({
        success: true,
        analytics: {
          orders: {
            current: orderStats[0].current[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
            previous: orderStats[0].previous[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
            statusBreakdown: orderStats[0].statusBreakdown
          },
          users: {
            current: userStats[0].current[0] || { newUsers: 0, activeUsers: 0 },
            previous: userStats[0].previous[0] || { newUsers: 0, activeUsers: 0 },
            roleBreakdown: userStats[0].roleBreakdown
          },
          products: {
            current: productStats[0].current[0] || { newProducts: 0 },
            previous: productStats[0].previous[0] || { newProducts: 0 },
            categoryBreakdown: productStats[0].categoryBreakdown
          },
          tasks: {
            current: taskStats[0].current[0] || { newTasks: 0, completedTasks: 0 },
            statusBreakdown: taskStats[0].statusBreakdown,
            priorityBreakdown: taskStats[0].priorityBreakdown
          },
          carts: cartStats[0] || { totalCarts: 0, activeCarts: 0, averageCartValue: 0 },
          favorites: favoriteStats[0] || { totalFavorites: 0, uniqueUsers: 0, uniqueProducts: 0 }
        },
        period: {
          days: period,
          from: periodDate,
          to: new Date()
        }
      });
    }

    if (type === 'sales') {
      // Детальная аналитика продаж
      const salesData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: periodDate },
            status: { $in: ['delivered', 'shipped', 'processing'] }
          }
        },
        {
          $facet: {
            dailyTrend: [
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: '%Y-%m-%d',
                      date: '$createdAt'
                    }
                  },
                  revenue: { $sum: '$totalAmount' },
                  orders: { $sum: 1 }
                }
              },
              { $sort: { '_id': 1 } }
            ],
            topProducts: [
              { $unwind: '$items' },
              {
                $group: {
                  _id: '$items.productId',
                  totalSold: { $sum: '$items.quantity' },
                  revenue: { $sum: '$items.total' }
                }
              },
              {
                $lookup: {
                  from: 'products',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'product'
                }
              },
              { $unwind: '$product' },
              {
                $project: {
                  productName: '$product.name',
                  totalSold: 1,
                  revenue: 1
                }
              },
              { $sort: { revenue: -1 } },
              { $limit: 10 }
            ]
          }
        }
      ]);

      return NextResponse.json({
        success: true,
        salesAnalytics: salesData[0]
      });
    }

    return NextResponse.json(
      { error: 'Invalid analytics type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}