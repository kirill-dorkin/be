import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Проверка прав администратора
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Требуется авторизация' },
      { status: 401 }
    );
  }
  
  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Недостаточно прав доступа' },
      { status: 403 }
    );
  }
  
  return null;
}

// Имитация данных контента
const mockContent = [
  {
    id: '1',
    type: 'page',
    status: 'published',
    viewCount: 1250,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'page',
    status: 'published',
    viewCount: 890,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'news',
    status: 'published',
    viewCount: 2100,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    type: 'post',
    status: 'draft',
    viewCount: 0,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    type: 'faq',
    status: 'published',
    viewCount: 1580,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '6',
    type: 'page',
    status: 'archived',
    viewCount: 450,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '7',
    type: 'news',
    status: 'draft',
    viewCount: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '8',
    type: 'post',
    status: 'published',
    viewCount: 780,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// GET - получение статистики контента
export async function GET(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    // Общая статистика
    const total = mockContent.length;
    const published = mockContent.filter(item => item.status === 'published').length;
    const draft = mockContent.filter(item => item.status === 'draft').length;
    const archived = mockContent.filter(item => item.status === 'archived').length;
    
    // Статистика по типам
    const byType = mockContent.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Общее количество просмотров
    const totalViews = mockContent.reduce((sum, item) => sum + item.viewCount, 0);
    
    // Статистика за последние 30 дней
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentContent = mockContent.filter(item => 
      new Date(item.createdAt) >= thirtyDaysAgo
    );
    
    // Топ контента по просмотрам
    const topContent = mockContent
      .filter(item => item.status === 'published')
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        type: item.type,
        viewCount: item.viewCount
      }));
    
    // Статистика активности по дням (последние 7 дней)
    const activityData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayContent = mockContent.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= dayStart && itemDate < dayEnd;
      });
      
      activityData.push({
        date: date.toISOString().split('T')[0],
        created: dayContent.length,
        views: Math.floor(Math.random() * 500) + 100 // Имитация просмотров за день
      });
    }
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const stats = {
      total,
      published,
      draft,
      archived,
      byType,
      totalViews,
      recentContent: recentContent.length,
      topContent,
      activityData,
      trends: {
        contentGrowth: {
          value: Math.floor(Math.random() * 20) + 5,
          type: 'increase' as const
        },
        viewsGrowth: {
          value: Math.floor(Math.random() * 15) + 8,
          type: 'increase' as const
        },
        publishedRate: {
          value: Math.round((published / total) * 100),
          type: 'neutral' as const
        }
      },
      performance: {
        avgViewsPerContent: Math.round(totalViews / total),
        mostPopularType: Object.entries(byType).reduce((a, b) => 
          byType[a[0]] > byType[b[0]] ? a : b
        )[0],
        publishingFrequency: Math.round(recentContent.length / 30 * 7) // контента в неделю
      }
    };
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Ошибка получения статистики контента:', error);
    return NextResponse.json(
      { error: 'Ошибка получения статистики контента' },
      { status: 500 }
    );
  }
}