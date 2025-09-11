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

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
}

export default function AdminDashboard() {
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
        throw new Error('Ошибка при загрузке статистики');
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
        title: 'Ошибка',
        description: 'Не удалось загрузить статистику'
      });
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

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
          Админ панель
        </h1>
        <p className="text-gray-600 mt-1">Управление интернет-магазином</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Активных: {stats?.activeProducts || 0}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заказы</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Всего заказов
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Общая сумма заказов
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Скоро доступно
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Управление товарами</h3>
                  <p className="text-sm text-gray-600">Добавить, редактировать или удалить товары</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href="/admin/products" className="flex-1">
                  <Button className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Просмотр
                  </Button>
                </Link>
                <Link href="/admin/products" className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить
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
                  <h3 className="font-medium">Заказы</h3>
                  <p className="text-sm text-gray-600">Просмотр и управление заказами</p>
                </div>
              </div>
              <div className="mt-4">
                <Button className="w-full" size="sm" disabled>
                  <Eye className="h-4 w-4 mr-2" />
                  Скоро доступно
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
                  <h3 className="font-medium">Настройки</h3>
                  <p className="text-sm text-gray-600">Конфигурация магазина</p>
                </div>
              </div>
              <div className="mt-4">
                <Button className="w-full" size="sm" disabled>
                  <Settings className="h-4 w-4 mr-2" />
                  Скоро доступно
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Последние действия */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Последние действия</h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <BarChart3 className="h-16 w-16 mx-auto text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Журнал активности
                </h3>
                <p className="text-gray-500">
                  Здесь будут отображаться последние действия в системе
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}