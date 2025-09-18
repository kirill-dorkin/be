'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download,
  RefreshCw
} from 'lucide-react';
import '@/styles/analytics.css';

// Импорт созданных компонентов
import { AnalyticsFilters, FilterState } from '@/components/analytics/AnalyticsFilters';
import { MetricsGrid } from '@/components/analytics/MetricCard';
import { LineChart, PieChart, BarChart } from '@/components/charts';
import { DataTable, TableColumn } from '@/components/analytics/DataTable';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { ApiChartData } from '@/services/analyticsApi';

interface AnalyticsData {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalProducts: number;
    totalEmployees: number;
    activeTasks: number;
    pendingOrders: number;
    completedOrders: number;
  };
  salesAnalytics: {
    dailySales: Array<{ date: string; revenue: number; orders: number }>;
    monthlySales: Array<{ month: string; revenue: number; orders: number }>;
    topProducts: Array<{ productId: string; name: string; sales: number; revenue: number }>;
    salesByCategory: Array<{ category: string; sales: number; revenue: number }>;
  };
  orderAnalytics: {
    ordersByStatus: Array<{ status: string; count: number }>;
    ordersByPaymentMethod: Array<{ method: string; count: number; revenue: number }>;
    averageOrderValue: number;
    orderTrends: Array<{ date: string; count: number }>;
  };
  userAnalytics: {
    newUsersToday: number;
    activeUsers: number;
    userGrowth: Array<{ date: string; newUsers: number; totalUsers: number }>;
    usersByRegion: Array<{ region: string; count: number }>;
  };
  employeeAnalytics: {
    employeesByRole: Array<{ role: string; count: number }>;
    employeesByDepartment: Array<{ department: string; count: number }>;
    activeEmployees: number;
    recentLogins: Array<{ employeeId: string; name: string; lastLogin: string }>;
  };
}

// Моковые данные для демонстрации
const mockSalesData = [
  { name: 'Янв', value: 4000 },
  { name: 'Фев', value: 3000 },
  { name: 'Мар', value: 5000 },
  { name: 'Апр', value: 4500 },
  { name: 'Май', value: 6000 },
  { name: 'Июн', value: 5500 },
  { name: 'Июл', value: 7000 },
];

const mockCategoryData = [
  { name: 'Электроника', value: 35, color: '#3b82f6' },
  { name: 'Одежда', value: 25, color: '#ef4444' },
  { name: 'Дом и сад', value: 20, color: '#10b981' },
  { name: 'Спорт', value: 15, color: '#f59e0b' },
  { name: 'Прочее', value: 5, color: '#8b5cf6' },
];

const mockTableData = [
  { id: 1, product: 'iPhone 15 Pro', category: 'Электроника', sales: 1250, revenue: 1875000, growth: 12.5 },
  { id: 2, product: 'Samsung Galaxy S24', category: 'Электроника', sales: 980, revenue: 1470000, growth: 8.3 },
  { id: 3, product: 'Nike Air Max', category: 'Спорт', sales: 750, revenue: 112500, growth: -2.1 },
  { id: 4, product: 'MacBook Pro', category: 'Электроника', sales: 420, revenue: 1260000, growth: 15.7 },
  { id: 5, product: 'Adidas Ultraboost', category: 'Спорт', sales: 650, revenue: 97500, growth: 5.2 },
];

// Функция для трансформации ApiChartData в DataPoint для LineChart
const transformChartData = (data: ApiChartData[]) => {
  return data.map(item => ({
    name: item.date,
    value: item.revenue
  }));
};

// Функция для трансформации ApiChartData в DataPoint для BarChart
const transformBarChartData = (data: ApiChartData[]) => {
  return data.map(item => ({
    name: item.date,
    value: item.orders
  }));
};

const tableColumns: TableColumn[] = [
  { key: 'product', label: 'Товар', sortable: true },
  { key: 'category', label: 'Категория', sortable: true },
  { key: 'sales', label: 'Продажи', sortable: true, align: 'right' },
  { 
    key: 'revenue', 
    label: 'Выручка', 
    sortable: true, 
    align: 'right',
    render: (value) => `₽${(value as number).toLocaleString()}`
  },
  { 
    key: 'growth', 
    label: 'Рост', 
    sortable: true, 
    align: 'right',
    render: (value) => {
      const growthValue = value as number;
      return (
        <span className={growthValue >= 0 ? 'text-green-600' : 'text-red-600'}>
          {growthValue >= 0 ? '+' : ''}{growthValue}%
        </span>
      );
    }
  },
];

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date()
    },
    period: 'last30days',
    metric: 'all',
    category: 'all'
  });

  // Проверка авторизации
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
        setError(null);
      } else {
        setError(data.error || 'Ошибка загрузки аналитики');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // Используем хук для работы с API аналитики
  const {
    metrics,
    chartData,
    tableData,
    isLoading,
    isRefreshing,
    isExporting,
    error: hookError,
    refreshData,
    loadTableData,
    exportData,
    clearError
  } = useAnalytics(filters, {
    useMockData: true, // В продакшене установить false
    autoRefresh: true,
    onError: (error) => {
      console.error('Analytics error:', error);
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      pending: 'Ожидает',
      processing: 'Обрабатывается',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Загрузка аналитики...</div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error || 'Ошибка загрузки аналитики'}</div>
          <button
            onClick={fetchAnalytics}
            className="text-red-600 hover:text-red-800 mt-2 inline-block"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Обработчики событий
  const handleRefresh = async () => {
    clearError();
    await refreshData();
    await fetchAnalytics();
  };

  const handleExport = async () => {
    await exportData('csv');
  };

  const handleTablePageChange = async (page: number, limit: number) => {
    await loadTableData(page, limit);
  };

  return (
    <div className="analytics-container">
      {/* Заголовок страницы */}
      <div className="analytics-header">
        <div className="min-w-0 flex-1">
          <h1 className="analytics-title">Аналитика</h1>
          <p className="analytics-description">
            Отслеживайте ключевые показатели и метрики вашего бизнеса
          </p>
        </div>
        <div className="analytics-actions">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-4"
          >
            <option value="1d">Сегодня</option>
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
            <option value="90d">90 дней</option>
            <option value="1y">Год</option>
          </select>
          <Button variant="outline" onClick={handleExport} className="button-touch">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Экспорт отчета</span>
            <span className="sm:hidden">Экспорт</span>
          </Button>
          <Button onClick={handleRefresh} className="button-touch" disabled={refreshing}>
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{refreshing ? 'Обновление...' : 'Обновить'}</span>
            <span className="sm:hidden">↻</span>
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={handleRefresh}
        onExport={handleExport}
        isLoading={isRefreshing || isExporting}
      />

      {/* Обработка ошибок */}
      {(error || hookError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-red-800">
              <strong>Ошибка:</strong> {error || hookError}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { clearError(); setError(null); }}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Общая статистика */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Заказы</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(analytics.overview.totalOrders)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Выручка</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analytics.overview.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Пользователи</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(analytics.overview.totalUsers)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Товары</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(analytics.overview.totalProducts)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Метрики */}
      <MetricsGrid metrics={metrics} />

      {/* Графики */}
      <div className="analytics-charts-grid">
        {/* Линейный график */}
        <Card className="chart-card">
          <CardHeader className="chart-header">
            <CardTitle className="chart-title">Динамика продаж</CardTitle>
          </CardHeader>
          <CardContent className="chart-content">
            <LineChart
              data={chartData.lineChart ? transformChartData(chartData.lineChart) : mockSalesData}
              height={300}
              color="#3b82f6"
              showGrid={true}
            />
          </CardContent>
        </Card>
        
        <Card className="chart-card">
          <CardHeader className="chart-header">
            <CardTitle className="chart-title">Распределение по категориям</CardTitle>
          </CardHeader>
          <CardContent className="chart-content">
            <PieChart
              data={chartData.pieChart || mockCategoryData}
              height={300}
              showLegend={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Дополнительная аналитика */}
      <div className="analytics-details-grid">
        <div className="analytics-table-section">
          <DataTable
            title="Топ товары по продажам"
            columns={tableColumns}
            data={tableData.data || mockTableData}
            searchable={true}
            exportable={true}
            pageSize={10}
          />
        </div>
        
        <Card className="chart-card">
          <CardHeader className="chart-header">
            <CardTitle className="chart-title">Популярные категории</CardTitle>
          </CardHeader>
          <CardContent className="chart-content">
            <BarChart
              data={chartData.barChart ? transformBarChartData(chartData.barChart) : mockCategoryData}
              height={300}
              color="#10b981"
              orientation="horizontal"
            />
          </CardContent>
        </Card>
      </div>

      {/* Расширенная аналитика */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Статистика заказов */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Заказы по статусам</h2>
              <div className="space-y-3">
                {analytics.orderAnalytics.ordersByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    <span className="font-semibold">{formatNumber(item.count)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Топ товары */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Топ товары</h2>
              <div className="space-y-3">
                {analytics.salesAnalytics.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium truncate">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatCurrency(product.revenue)}</div>
                      <div className="text-xs text-gray-500">{formatNumber(product.sales)} продаж</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Сотрудники по ролям */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Сотрудники</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Всего сотрудников</span>
                  <span className="font-semibold">{formatNumber(analytics.overview.totalEmployees)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Активных</span>
                  <span className="font-semibold text-green-600">{formatNumber(analytics.employeeAnalytics.activeEmployees)}</span>
                </div>
                <hr className="my-3" />
                {analytics.employeeAnalytics.employeesByRole.map((role) => (
                  <div key={role.role} className="flex justify-between">
                    <span className="text-sm text-gray-600 capitalize">{role.role}</span>
                    <span className="font-medium">{formatNumber(role.count)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Пользователи */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Пользователи</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Новые сегодня</span>
                  <span className="font-semibold text-blue-600">{formatNumber(analytics.userAnalytics.newUsersToday)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Активные</span>
                  <span className="font-semibold text-green-600">{formatNumber(analytics.userAnalytics.activeUsers)}</span>
                </div>
                <hr className="my-3" />
                <h3 className="text-sm font-medium text-gray-700">По регионам:</h3>
                {analytics.userAnalytics.usersByRegion.slice(0, 3).map((region) => (
                  <div key={region.region} className="flex justify-between">
                    <span className="text-sm text-gray-600">{region.region}</span>
                    <span className="font-medium">{formatNumber(region.count)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Задачи и активность */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Активность</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Активные задачи</span>
                  <span className="font-semibold text-orange-600">{formatNumber(analytics.overview.activeTasks)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ожидающие заказы</span>
                  <span className="font-semibold text-yellow-600">{formatNumber(analytics.overview.pendingOrders)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Завершенные заказы</span>
                  <span className="font-semibold text-green-600">{formatNumber(analytics.overview.completedOrders)}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Средний чек</span>
                  <span className="font-semibold">{formatCurrency(analytics.orderAnalytics.averageOrderValue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Продажи по категориям */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Продажи по категориям</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.salesAnalytics.salesByCategory.map((category) => (
                <div key={category.category} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{category.category}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Продажи</span>
                      <span className="font-medium">{formatNumber(category.sales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Выручка</span>
                      <span className="font-medium">{formatCurrency(category.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Последние входы сотрудников */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Последние входы сотрудников</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сотрудник
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Последний вход
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.employeeAnalytics.recentLogins.map((employee) => (
                    <tr key={employee.employeeId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(employee.lastLogin).toLocaleString('ru-RU')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/employees/${employee.employeeId}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Просмотр
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}