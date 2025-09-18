'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Eye,
  MousePointer,
  Clock,
  Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Интерфейсы
interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    revenueGrowth: number;
    ordersGrowth: number;
    usersGrowth: number;
    averageOrderValue: number;
  };
  revenueChart: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  topProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
    image?: string;
  }[];
  userActivity: {
    date: string;
    newUsers: number;
    activeUsers: number;
    returningUsers: number;
  }[];
  orderStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  salesByCategory: {
    category: string;
    sales: number;
    revenue: number;
  }[];
  conversionFunnel: {
    stage: string;
    users: number;
    conversionRate: number;
  }[];
  topCustomers: {
    id: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
  }[];
}

interface AnalyticsProps {
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Analytics({ className }: AnalyticsProps) {
  const { data: session } = useSession();
  
  // Состояния
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>('30d');
  const [chartType, setChartType] = useState<'revenue' | 'orders' | 'users'>('revenue');
  const [isExporting, setIsExporting] = useState(false);

  // Загрузка данных аналитики
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные аналитики',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, dateRange]);

  useEffect(() => {
    if (session) {
      fetchAnalytics();
    }
  }, [session, fetchAnalytics]);

  // Экспорт отчета
  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/admin/analytics/export?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to export report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `analytics-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Успешно',
        description: 'Отчет экспортирован',
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось экспортировать отчет',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Форматирование чисел
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Аналитика и отчеты</h1>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 дней</SelectItem>
              <SelectItem value="30d">30 дней</SelectItem>
              <SelectItem value="90d">90 дней</SelectItem>
              <SelectItem value="1y">1 год</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleExportReport}
            disabled={isExporting}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Экспорт...' : 'Экспорт'}
          </Button>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Общая выручка</p>
                <p className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  {data.overview.revenueGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${
                    data.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(data.overview.revenueGrowth)}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего заказов</p>
                <p className="text-2xl font-bold">{formatNumber(data.overview.totalOrders)}</p>
                <div className="flex items-center mt-1">
                  {data.overview.ordersGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${
                    data.overview.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(data.overview.ordersGrowth)}
                  </span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold">{formatNumber(data.overview.totalUsers)}</p>
                <div className="flex items-center mt-1">
                  {data.overview.usersGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${
                    data.overview.usersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(data.overview.usersGrowth)}
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Средний чек</p>
                <p className="text-2xl font-bold">{formatCurrency(data.overview.averageOrderValue)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatNumber(data.overview.totalProducts)} товаров
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График выручки/заказов */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Динамика продаж
              </CardTitle>
              <Select value={chartType} onValueChange={(value: 'revenue' | 'orders' | 'users') => setChartType(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Выручка</SelectItem>
                  <SelectItem value="orders">Заказы</SelectItem>
                  <SelectItem value="users">Пользователи</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'revenue' ? (
                <AreaChart data={data.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              ) : chartType === 'orders' ? (
                <LineChart data={data.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              ) : (
                <AreaChart data={data.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="newUsers" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="activeUsers" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="returningUsers" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Статусы заказов */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Статусы заказов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.orderStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.status} (${props.percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.orderStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Продажи по категориям */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Продажи по категориям
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.salesByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(Number(value)) : value,
                name === 'revenue' ? 'Выручка' : 'Продажи'
              ]} />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" name="Продажи" />
              <Bar dataKey="revenue" fill="#82ca9d" name="Выручка" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Воронка конверсии */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Воронка конверсии
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.conversionFunnel.map((stage, index) => (
              <div key={stage.stage} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{stage.stage}</p>
                    <p className="text-sm text-gray-500">{formatNumber(stage.users)} пользователей</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{stage.conversionRate.toFixed(1)}%</p>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${stage.conversionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Таблицы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ товары */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Топ товары
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>Продажи</TableHead>
                  <TableHead>Выручка</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.sales}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(product.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Топ клиенты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Топ клиенты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Заказы</TableHead>
                  <TableHead>Потрачено</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(customer.totalSpent)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}