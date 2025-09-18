'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Eye,
  Plus,
  BarChart3,
  Settings,
  FileText,
  Bell,
  Monitor,
  Archive,
  RotateCcw,
  Edit,
  Trash2,
  MessageSquare,
  Send,
  Zap,
  Database
} from 'lucide-react';
import useCustomToast from '@/hooks/useCustomToast';
import useDashboardCache from '@/hooks/useDashboardCache';
import { SkeletonDashboard } from '@/components/ui/skeleton-dashboard';
import AdaptiveStatsCard from '@/components/dashboard/AdaptiveStatsCard';
import AdaptiveActionCard from '@/components/dashboard/AdaptiveActionCard';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
}

export default function AdminDashboard() {
  const { showErrorToast } = useCustomToast();
  const {
    getMetrics
  } = useDashboardCache({ enableBackgroundRefresh: true });
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isTV, setIsTV] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsTV(width >= 1920 && height >= 1080);
      setIsLargeScreen(width >= 1440 && width < 1920);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Загрузка статистики с кэшированием
  const fetchStats = useCallback(async () => {
    try {
      // Попытка получить кэшированные данные из localStorage
      const cachedData = localStorage.getItem('dashboard-stats-cache');
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > 5 * 60 * 1000; // 5 минут
        
        if (!isExpired) {
          setStats(data);
          setLoading(false);
          return;
        }
      }
      
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch('/api/orders', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
      ]);
      
      if (!productsRes.ok || !ordersRes.ok) {
        throw new Error('Ошибка загрузки статистики');
      }
      
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      
      const products = productsData.products || [];
      const orders = ordersData.orders || [];
      
      const totalRevenue = orders.reduce((sum: number, order: { totalAmount?: number }) => {
        return sum + (order.totalAmount || 0);
      }, 0);
      
      const activeProducts = products.filter((product: { inStock: boolean }) => product.inStock).length;
      
      const statsData = {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        activeProducts
      };
      
      setStats(statsData);
      
      // Кэшируем полученные данные
      const metricsData = await getMetrics();
      if (metricsData) {
        // Обновляем кэш с новыми данными
        localStorage.setItem('dashboard-stats-cache', JSON.stringify({
          data: statsData,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось загрузить статистику'
      });
    } finally {
      setLoading(false);
    }
  }, [showErrorToast, getMetrics]);

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <SkeletonDashboard variant="admin" />;
  }

  return (
    <div className={cn(
      "space-y-6 lg:space-y-8",
      isTV && "space-y-12",
      isLargeScreen && "space-y-10"
    )}>
      {/* Заголовок */}
      <div className="text-center lg:text-left">
        <h1 className={cn(
          "text-2xl lg:text-3xl xl:text-4xl font-bold flex items-center justify-center lg:justify-start gap-2",
          isTV && "text-6xl gap-4",
          isLargeScreen && "text-5xl gap-3"
        )}>
          <BarChart3 className={cn(
            "h-6 w-6 lg:h-8 lg:w-8",
            isTV && "h-16 w-16",
            isLargeScreen && "h-12 w-12"
          )} />
          Панель администратора
        </h1>
        <p className={cn(
          "text-gray-600 mt-1 text-sm lg:text-base",
          isTV && "text-2xl mt-3",
          isLargeScreen && "text-xl mt-2"
        )}>Управление товарами, заказами и настройками</p>
      </div>

      {/* Статистика */}
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6",
        isTV && "gap-8",
        isLargeScreen && "gap-7"
      )}>
        <AdaptiveStatsCard
          title="Всего товаров"
          value={stats?.totalProducts || 0}
          subtitle={`Активных: ${stats?.activeProducts || 0}`}
          icon={Package}
        />
        
        <AdaptiveStatsCard
          title="Заказы"
          value={stats?.totalOrders || 0}
          subtitle="Всего заказов"
          icon={ShoppingCart}
        />
        
        <AdaptiveStatsCard
          title="Выручка"
          value={formatPrice(stats?.totalRevenue || 0)}
          subtitle="Общая выручка"
          icon={TrendingUp}
        />
        
        <AdaptiveStatsCard
          title="Пользователи"
          value="-"
          subtitle="Скоро"
          icon={Users}
        />
      </div>

      {/* Быстрые действия */}
      <div>
        <h2 className={cn(
          "text-lg lg:text-xl font-semibold mb-4 text-center lg:text-left",
          isTV && "text-3xl mb-8",
          isLargeScreen && "text-2xl mb-6"
        )}>Быстрые действия</h2>
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6",
          isTV && "gap-8",
          isLargeScreen && "gap-7"
        )}>
          <AdaptiveActionCard
            title="Управление товарами"
            description="Добавление, редактирование и удаление товаров"
            icon={Package}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            actions={[
              {
                label: "Просмотр",
                href: "/admin/products",
                icon: Eye,
                variant: "default"
              },
              {
                label: "Добавить",
                href: "/admin/products",
                icon: Plus,
                variant: "outline"
              }
            ]}
          />
          
          <AdaptiveActionCard
            title="Заказы"
            description="Просмотр и управление заказами"
            icon={ShoppingCart}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            actions={[
              {
                label: "Просмотр",
                href: "/admin/orders",
                icon: Eye,
                variant: "default"
              }
            ]}
          />
          
          <AdaptiveActionCard
            title="Управление контентом"
            description="CMS для статических страниц"
            icon={FileText}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
            actions={[
              {
                label: "Просмотр",
                href: "/admin/content",
                icon: Eye,
                variant: "default"
              },
              {
                label: "Добавить",
                href: "/admin/content",
                icon: Plus,
                variant: "outline"
              }
            ]}
          />
          
          <AdaptiveActionCard
            title="API Интеграции"
            description="Управление внешними API и сервисами"
            icon={Settings}
            iconColor="text-cyan-600"
            iconBgColor="bg-cyan-100"
            actions={[
              {
                label: "Просмотр",
                href: "/admin/integrations",
                icon: Eye,
                variant: "default"
              },
              {
                label: "Настройки",
                href: "/admin/integrations",
                icon: Settings,
                variant: "outline"
              }
            ]}
          />
          
          <AdaptiveActionCard
            title="Кэш и Производительность"
            description="Управление кэшем и оптимизация системы"
            icon={Monitor}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
            actions={[
              {
                label: "Статистика",
                href: "/admin/cache",
                icon: BarChart3,
                variant: "default"
              },
              {
                label: "Очистить",
                href: "/admin/cache?action=clear",
                icon: RotateCcw,
                variant: "outline"
              }
            ]}
          />
          
          <AdaptiveActionCard
            title="Уведомления"
            description="Система коммуникации с пользователями"
            icon={Bell}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-100"
            actions={[
              {
                label: "Управление",
                href: "/admin/notifications",
                icon: Bell,
                variant: "default"
              },
              {
                label: "Создать",
                href: "/admin/notifications",
                icon: Plus,
                variant: "outline"
              }
            ]}
          />
          
          <AdaptiveActionCard
            title="Логи и мониторинг"
            description="Система логов и мониторинга активности"
            icon={Monitor}
            iconColor="text-slate-600"
            iconBgColor="bg-slate-100"
            actions={[
              {
                label: "Просмотр",
                href: "/admin/logs",
                icon: Eye,
                variant: "default"
              },
              {
                label: "Метрики",
                href: "/admin/logs",
                icon: BarChart3,
                variant: "outline"
              }
            ]}
          />
          
          <AdaptiveActionCard
            title="Резервное копирование"
            description="Управление резервными копиями и восстановление данных"
            icon={Archive}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
            actions={[
              {
                label: "Копии",
                href: "/admin/backup",
                icon: Archive,
                variant: "default"
              },
              {
                label: "Восстановление",
                href: "/admin/backup?tab=restore",
                icon: RotateCcw,
                variant: "outline"
              }
            ]}
          />
          
          <AdaptiveActionCard
            title="Настройки"
            description="Конфигурация системы"
            icon={Settings}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            actions={[
              {
                label: "Открыть",
                href: "/admin/settings",
                icon: Settings,
                variant: "default"
              }
            ]}
          />
        </div>
      </div>

      {/* Последние действия */}
      <div>
        <h2 className={cn(
          "text-lg lg:text-xl font-semibold mb-4 text-center lg:text-left",
          isTV && "text-3xl mb-8",
          isLargeScreen && "text-2xl mb-6"
        )}>Последние действия</h2>
        <Card>
          <CardContent className={cn(
            "p-4 lg:p-6",
            isTV && "p-12",
            isLargeScreen && "p-8"
          )}>
            <div className={cn(
              "text-center space-y-4",
              isTV && "space-y-8",
              isLargeScreen && "space-y-6"
            )}>
              <BarChart3 className={cn(
                "h-12 w-12 lg:h-16 lg:w-16 mx-auto text-gray-400",
                isTV && "h-24 w-24",
                isLargeScreen && "h-20 w-20"
              )} />
              <div>
                <h3 className={cn(
                  "text-base lg:text-lg font-medium text-gray-900",
                  isTV && "text-2xl",
                  isLargeScreen && "text-xl"
                )}>
                  Журнал активности
                </h3>
                <p className={cn(
                  "text-sm lg:text-base text-gray-500",
                  isTV && "text-lg",
                  isLargeScreen && "text-base"
                )}>
                  Здесь будет отображаться история действий
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PWA Cache Management */}
      <div className="mt-8">
        <h2 className={cn(
          "text-xl lg:text-2xl font-bold mb-6 text-gray-900",
          isTV && "text-3xl",
          isLargeScreen && "text-2xl"
        )}>
          Управление PWA
        </h2>
        <Card className="w-full">
          <CardContent className="p-6">
            <p className="text-gray-600">Управление кэшем и PWA функциями будет доступно в следующих обновлениях.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}