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
  Settings
} from 'lucide-react';
import useCustomToast from '@/hooks/useCustomToast';
import Spinner from '@/components/ui/spinner';
import { useTranslations } from 'next-intl';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
}

export default function AdminDashboard() {
  const t = useTranslations();
  const { showErrorToast } = useCustomToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка статистики
  const fetchStats = useCallback(async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ]);
      
      if (!productsRes.ok || !ordersRes.ok) {
        throw new Error(t('admin.dashboard.errors.loadStats'));
      }
      
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      
      const products = productsData.products || [];
      const orders = ordersData.orders || [];
      
      const totalRevenue = orders.reduce((sum: number, order: { totalAmount?: number }) => {
        return sum + (order.totalAmount || 0);
      }, 0);
      
      const activeProducts = products.filter((product: { inStock: boolean }) => product.inStock).length;
      
      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        activeProducts
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      showErrorToast({
        title: t('common.status.error'),
        description: t('admin.dashboard.errors.loadStatsFailed')
      });
    } finally {
      setLoading(false);
    }
  }, [showErrorToast, t]);

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          {t('admin.dashboard.title')}
        </h1>
        <p className="text-gray-600 mt-1">{t('admin.dashboard.subtitle')}</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.dashboard.stats.totalProducts')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.stats.active', { count: stats?.activeProducts || 0 })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.dashboard.stats.orders')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.stats.totalOrders')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.dashboard.stats.revenue')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.stats.totalRevenue')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.dashboard.stats.users')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.stats.comingSoon')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('admin.dashboard.quickActions.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{t('admin.dashboard.quickActions.productManagement.title')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.dashboard.quickActions.productManagement.description')}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href="/admin/products" className="flex-1">
                  <Button className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    {t('admin.dashboard.quickActions.productManagement.view')}
                  </Button>
                </Link>
                <Link href="/admin/products" className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.dashboard.quickActions.productManagement.add')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{t('admin.dashboard.quickActions.orders.title')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.dashboard.quickActions.orders.description')}</p>
                </div>
              </div>
              <div className="mt-4">
                <Button className="w-full" size="sm" disabled>
                  <Eye className="h-4 w-4 mr-2" />
                  {t('admin.dashboard.quickActions.orders.comingSoon')}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{t('admin.dashboard.quickActions.settings.title')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.dashboard.quickActions.settings.description')}</p>
                </div>
              </div>
              <div className="mt-4">
                <Button className="w-full" size="sm" disabled>
                  <Settings className="h-4 w-4 mr-2" />
                  {t('admin.dashboard.quickActions.settings.comingSoon')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Последние действия */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('admin.dashboard.recentActivity.title')}</h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <BarChart3 className="h-16 w-16 mx-auto text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {t('admin.dashboard.recentActivity.activityLog')}
                </h3>
                <p className="text-gray-500">
                  {t('admin.dashboard.recentActivity.description')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}