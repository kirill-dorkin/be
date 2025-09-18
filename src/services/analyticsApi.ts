import type { FilterState, MetricCardProps } from '@/components/analytics';

// Типы для API ответов
export interface ApiMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  size: 'sm' | 'md' | 'lg';
}

export interface ApiChartData {
  date: string;
  revenue: number;
  orders: number;
  users: number;
  conversion: number;
}

export interface ApiCategoryData {
  name: string;
  value: number;
  color?: string;
}

export interface ApiTableRow {
  id: string;
  product: string;
  category: string;
  sales: number;
  revenue: number;
  status: 'active' | 'inactive' | 'pending';
  date: string;
  [key: string]: unknown;
}

export interface AnalyticsApiResponse {
  metrics: ApiMetric[];
  chartData: ApiChartData[];
  categoryData: ApiCategoryData[];
  tableData: ApiTableRow[];
  totalRecords: number;
}

// Конфигурация API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const API_ENDPOINTS = {
  analytics: `${API_BASE_URL}/analytics`,
  metrics: `${API_BASE_URL}/analytics/metrics`,
  charts: `${API_BASE_URL}/analytics/charts`,
  export: `${API_BASE_URL}/analytics/export`,
} as const;

// Утилиты для работы с API
class AnalyticsApiService {
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private buildQueryString(filters: FilterState): string {
    const params = new URLSearchParams();
    
    if (filters.period) params.append('period', filters.period);
    if (filters.metric) params.append('metric', filters.metric);
    if (filters.category) params.append('category', filters.category);
    
    if (filters.dateRange.from) {
      params.append('dateFrom', filters.dateRange.from.toISOString());
    }
    if (filters.dateRange.to) {
      params.append('dateTo', filters.dateRange.to.toISOString());
    }

    return params.toString();
  }

  // Получение всех данных аналитики
  async getAnalyticsData(filters: FilterState): Promise<AnalyticsApiResponse> {
    const queryString = this.buildQueryString(filters);
    const url = `${API_ENDPOINTS.analytics}?${queryString}`;
    
    return this.makeRequest<AnalyticsApiResponse>(url);
  }

  // Получение только метрик
  async getMetrics(filters: FilterState): Promise<ApiMetric[]> {
    const queryString = this.buildQueryString(filters);
    const url = `${API_ENDPOINTS.metrics}?${queryString}`;
    
    return this.makeRequest<ApiMetric[]>(url);
  }

  // Получение данных для графиков
  async getChartData(filters: FilterState): Promise<{
    lineChart: ApiChartData[];
    pieChart: ApiCategoryData[];
    barChart: ApiChartData[];
  }> {
    const queryString = this.buildQueryString(filters);
    const url = `${API_ENDPOINTS.charts}?${queryString}`;
    
    return this.makeRequest<{
      lineChart: ApiChartData[];
      pieChart: ApiCategoryData[];
      barChart: ApiChartData[];
    }>(url);
  }

  // Получение данных для таблицы с пагинацией
  async getTableData(
    filters: FilterState,
    page: number = 1,
    limit: number = 10,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    search?: string
  ): Promise<{
    data: ApiTableRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams(this.buildQueryString(filters));
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (search) params.append('search', search);

    const url = `${API_ENDPOINTS.analytics}/table?${params.toString()}`;
    
    return this.makeRequest<{
      data: ApiTableRow[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(url);
  }

  // Экспорт данных
  async exportData(
    filters: FilterState,
    format: 'csv' | 'xlsx' | 'pdf' = 'csv'
  ): Promise<Blob> {
    const queryString = this.buildQueryString(filters);
    const url = `${API_ENDPOINTS.export}?${queryString}&format=${format}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 
                 format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                 'application/pdf'
      }
    });

    if (!response.ok) {
      throw new Error(`Export failed! status: ${response.status}`);
    }

    return response.blob();
  }
}

// Создаем экземпляр сервиса
export const analyticsApi = new AnalyticsApiService();

// Моковые данные для разработки (fallback)
export const mockAnalyticsData: AnalyticsApiResponse = {
  metrics: [
    {
      id: '1',
      title: 'Общая выручка',
      value: '₽2,847,392',
      change: 12.5,
      changeType: 'increase',
      icon: 'DollarSign',
      color: 'green',
      size: 'lg'
    },
    {
      id: '2',
      title: 'Заказы',
      value: '1,429',
      change: 8.2,
      changeType: 'increase',
      icon: 'ShoppingCart',
      color: 'blue',
      size: 'md'
    },
    {
      id: '3',
      title: 'Пользователи',
      value: '12,847',
      change: -2.1,
      changeType: 'decrease',
      icon: 'Users',
      color: 'purple',
      size: 'md'
    },
    {
      id: '4',
      title: 'Конверсия',
      value: '3.24%',
      change: 0.8,
      changeType: 'increase',
      icon: 'TrendingUp',
      color: 'yellow',
      size: 'sm'
    }
  ],
  chartData: [
    { date: '01.01', revenue: 45000, orders: 120, users: 1200, conversion: 3.2 },
    { date: '02.01', revenue: 52000, orders: 145, users: 1350, conversion: 3.4 },
    { date: '03.01', revenue: 48000, orders: 132, users: 1180, conversion: 3.1 },
    { date: '04.01', revenue: 61000, orders: 168, users: 1520, conversion: 3.6 },
    { date: '05.01', revenue: 55000, orders: 151, users: 1420, conversion: 3.3 },
    { date: '06.01', revenue: 67000, orders: 189, users: 1680, conversion: 3.8 },
    { date: '07.01', revenue: 59000, orders: 162, users: 1540, conversion: 3.5 }
  ],
  categoryData: [
    { name: 'Электроника', value: 35, color: '#8884d8' },
    { name: 'Одежда', value: 28, color: '#82ca9d' },
    { name: 'Дом и сад', value: 22, color: '#ffc658' },
    { name: 'Спорт', value: 15, color: '#ff7300' }
  ],
  tableData: [
    {
      id: '1',
      product: 'iPhone 15 Pro',
      category: 'Электроника',
      sales: 245,
      revenue: 294000,
      status: 'active',
      date: '2024-01-15'
    },
    {
      id: '2',
      product: 'Nike Air Max',
      category: 'Спорт',
      sales: 189,
      revenue: 151200,
      status: 'active',
      date: '2024-01-14'
    },
    {
      id: '3',
      product: 'Samsung TV 55"',
      category: 'Электроника',
      sales: 67,
      revenue: 134000,
      status: 'pending',
      date: '2024-01-13'
    }
  ],
  totalRecords: 150
};

// Хук для использования API с React Query (опционально)
export const useAnalyticsData = (filters: FilterState) => {
  // Здесь можно добавить интеграцию с React Query или SWR
  // для кеширования и автоматического обновления данных
};

// Утилиты для трансформации данных
export const transformApiMetricsToProps = (apiMetrics: ApiMetric[]): MetricCardProps[] => {
  return apiMetrics.map(metric => ({
    title: metric.title,
    value: metric.value,
    change: {
      value: metric.change,
      type: metric.changeType,
      period: 'за период'
    },
    icon: metric.icon as any, // Здесь нужно будет правильно типизировать иконки
    color: metric.color,
    size: metric.size
  }));
};

export default analyticsApi;