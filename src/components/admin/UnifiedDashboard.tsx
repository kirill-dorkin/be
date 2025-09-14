'use client'

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FaTasks, FaHourglassHalf, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useTranslations } from 'next-intl';
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
import TaskReport from "@/components/dashboard/TaskReport";
import UserList from "@/components/dashboard/UserList";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardGreater from "@/components/dashboard/DashboardGreater";
import AdminProfileHeader from "@/components/dashboard/AdminProfileHeader";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import ListCard from "@/components/dashboard/ListCard";
import { ITask } from "@/models/Task";
import { IUser } from "@/models/User";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
}

interface TaskMetrics {
  metrics?: {
    totalActiveTasks?: number;
    totalPendingTasks?: number;
    totalInProgressTasks?: number;
    totalCompletedTasks?: number;
  };
}

interface UnifiedDashboardProps {
  page: string | string[];
  perPage: string | string[];
  items: ITask[];
  totalItemsLength: number;
  users: IUser[];
  metrics: TaskMetrics;
}

const UnifiedDashboard = ({ 
  page, 
  perPage, 
  items, 
  totalItemsLength, 
  users, 
  metrics 
}: UnifiedDashboardProps) => {
  const t = useTranslations();
  const { showErrorToast } = useCustomToast();
  const [shopStats, setShopStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка статистики магазина
  const fetchShopStats = useCallback(async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products', { credentials: 'include' }),
        fetch('/api/orders', { credentials: 'include' })
      ]);
      
      if (!productsRes.ok || !ordersRes.ok) {
        throw new Error('Failed to load stats');
      }
      
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      
      const products = productsData.products || [];
      const orders = ordersData.orders || [];
      
      const totalRevenue = orders.reduce((sum: number, order: { totalAmount?: number }) => {
        return sum + (order.totalAmount || 0);
      }, 0);
      
      const activeProducts = products.filter((product: { inStock: boolean }) => product.inStock).length;
      
      setShopStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        activeProducts
      });
    } catch (error) {
      console.error('Error fetching shop stats:', error);
      showErrorToast({
        title: t('common.status.error'),
        description: t('admin.dashboard.errors.loadStatsFailed')
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShopStats();
  }, []);

  // Данные для метрик задач
  const taskMetrics = [
    {
      label: t('admin.dashboard.activeTasks'),
      value: metrics?.metrics?.totalActiveTasks ?? 0,
      icon: <FaTasks />,
    },
    {
      label: t('admin.dashboard.pendingTasks'),
      value: metrics?.metrics?.totalPendingTasks ?? 0,
      icon: <FaExclamationCircle />,
    },
    {
      label: t('admin.dashboard.inProgressTasks'),
      value: metrics?.metrics?.totalInProgressTasks ?? 0,
      icon: <FaHourglassHalf />,
    },
    {
      label: t('admin.dashboard.completedTasks'),
      value: metrics?.metrics?.totalCompletedTasks ?? 0,
      icon: <FaCheckCircle />,
    },
  ];

  if (loading) {
    return (
      <DashboardContainer className="w-full min-h-svh py-12 px-10 overflow-y-auto">
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="w-full min-h-svh py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex justify-between">
        <DashboardGreater />
        <AdminProfileHeader />
      </DashboardHeader>
      
      <DashboardContent className="space-y-8">
        {/* Статистика магазина */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('admin.dashboard.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('admin.dashboard.stats.totalProducts')}
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shopStats?.totalProducts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.dashboard.stats.active', { count: shopStats?.activeProducts || 0 })}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('admin.dashboard.stats.totalOrders')}
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shopStats?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.dashboard.stats.comingSoon')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('admin.dashboard.stats.totalRevenue')}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {shopStats?.totalRevenue ? `₽${shopStats.totalRevenue.toLocaleString()}` : '₽0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.dashboard.stats.comingSoon')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('admin.dashboard.stats.users')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.dashboard.stats.comingSoon')}
                </p>
              </CardContent>
            </Card>
          </div>
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
                  <Link href="/admin/products/new" className="flex-1">
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
                  <Link href="/admin/orders">
                    <Button className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      {t('admin.dashboard.quickActions.orders.view')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FaTasks className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{t('admin.dashboard.quickActions.tasks.title')}</h3>
                    <p className="text-sm text-gray-600">{t('admin.dashboard.quickActions.tasks.description')}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/admin/tasks">
                    <Button className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      {t('admin.dashboard.quickActions.tasks.view')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Основной контент с задачами и пользователями */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
          <DashboardSummary data={taskMetrics} />
          <section className="flex flex-col gap-6 col-span-1 sm:col-span-2 lg:col-span-5">
            <TaskReport
              page={page}
              per_page={perPage}
              items={items}
              totalItemsLength={totalItemsLength}
            />
          </section>
          <section className="flex flex-col col-span-1 sm:col-span-2 lg:col-span-2 gap-6">
            <ListCard
              title={t('admin.dashboard.employeeList.title')}
              description={t('admin.dashboard.employeeList.description')}
            >
              <UserList users={users} />
            </ListCard>
          </section>
        </div>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default UnifiedDashboard;