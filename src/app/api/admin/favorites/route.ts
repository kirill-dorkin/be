import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Favorite from '@/models/Favorite';
import User from '@/models/User';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// GET - Получить аналитику избранного для административной панели
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
    const type = searchParams.get('type') || 'users'; // users, products, analytics
    const period = searchParams.get('period') || '30'; // дни

    const periodDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    if (type === 'products') {
      // Топ избранных товаров
      const topProducts = await Favorite.aggregate([
        {
          $match: {
            addedAt: { $gte: periodDate }
          }
        },
        {
          $group: {
            _id: '$productId',
            favoriteCount: { $sum: 1 },
            lastAdded: { $max: '$addedAt' }
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
        {
          $unwind: '$product'
        },
        {
          $project: {
            productId: '$_id',
            productName: '$product.name',
            productPrice: '$product.price',
            productImages: '$product.images',
            favoriteCount: 1,
            lastAdded: 1
          }
        },
        {
          $sort: { favoriteCount: -1 }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ]);

      const totalProducts = await Favorite.aggregate([
        {
          $match: {
            addedAt: { $gte: periodDate }
          }
        },
        {
          $group: {
            _id: '$productId'
          }
        },
        {
          $count: 'total'
        }
      ]);

      return NextResponse.json({
        success: true,
        data: topProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((totalProducts[0]?.total || 0) / limit),
          totalItems: totalProducts[0]?.total || 0,
          itemsPerPage: limit
        }
      });
    }

    if (type === 'users') {
      // Пользователи с наибольшим количеством избранного
      const activeUsers = await Favorite.aggregate([
        {
          $match: {
            addedAt: { $gte: periodDate }
          }
        },
        {
          $group: {
            _id: '$userId',
            favoriteCount: { $sum: 1 },
            lastActivity: { $max: '$addedAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            userId: '$_id',
            userName: '$user.name',
            userEmail: '$user.email',
            favoriteCount: 1,
            lastActivity: 1
          }
        },
        {
          $sort: { favoriteCount: -1 }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ]);

      const totalUsers = await Favorite.aggregate([
        {
          $match: {
            addedAt: { $gte: periodDate }
          }
        },
        {
          $group: {
            _id: '$userId'
          }
        },
        {
          $count: 'total'
        }
      ]);

      return NextResponse.json({
        success: true,
        data: activeUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((totalUsers[0]?.total || 0) / limit),
          totalItems: totalUsers[0]?.total || 0,
          itemsPerPage: limit
        }
      });
    }

    if (type === 'analytics') {
      // Общая аналитика избранного
      const analytics = await Favorite.aggregate([
        {
          $facet: {
            totalStats: [
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
            ],
            periodStats: [
              {
                $match: {
                  addedAt: { $gte: periodDate }
                }
              },
              {
                $group: {
                  _id: null,
                  periodFavorites: { $sum: 1 },
                  periodUsers: { $addToSet: '$userId' },
                  periodProducts: { $addToSet: '$productId' }
                }
              },
              {
                $project: {
                  periodFavorites: 1,
                  periodUsers: { $size: '$periodUsers' },
                  periodProducts: { $size: '$periodProducts' }
                }
              }
            ],
            dailyTrend: [
              {
                $match: {
                  addedAt: { $gte: periodDate }
                }
              },
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: '%Y-%m-%d',
                      date: '$addedAt'
                    }
                  },
                  count: { $sum: 1 }
                }
              },
              {
                $sort: { '_id': 1 }
              }
            ]
          }
        }
      ]);

      return NextResponse.json({
        success: true,
        analytics: {
          total: analytics[0].totalStats[0] || { totalFavorites: 0, uniqueUsers: 0, uniqueProducts: 0 },
          period: analytics[0].periodStats[0] || { periodFavorites: 0, periodUsers: 0, periodProducts: 0 },
          dailyTrend: analytics[0].dailyTrend || []
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching favorites analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}