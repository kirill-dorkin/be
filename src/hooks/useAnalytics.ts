'use client';

import { useState, useEffect, useCallback } from 'react';
import { analyticsApi, mockAnalyticsData, transformApiMetricsToProps } from '@/services/analyticsApi';
import type { FilterState, MetricCardProps } from '@/components/analytics';
import type { 
  AnalyticsApiResponse, 
  ApiChartData, 
  ApiCategoryData, 
  ApiTableRow 
} from '@/services/analyticsApi';

interface UseAnalyticsState {
  // Данные
  metrics: MetricCardProps[];
  chartData: {
    lineChart: ApiChartData[];
    pieChart: ApiCategoryData[];
    barChart: ApiChartData[];
  };
  tableData: {
    data: ApiTableRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  
  // Состояние загрузки
  isLoading: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  
  // Ошибки
  error: string | null;
  
  // Методы
  refreshData: () => Promise<void>;
  loadTableData: (page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string) => Promise<void>;
  exportData: (format?: 'csv' | 'xlsx' | 'pdf') => Promise<void>;
  clearError: () => void;
}

interface UseAnalyticsOptions {
  // Использовать ли моковые данные для разработки
  useMockData?: boolean;
  // Автоматически загружать данные при изменении фильтров
  autoRefresh?: boolean;
  // Интервал автообновления в миллисекундах
  refreshInterval?: number;
  // Обработчик ошибок
  onError?: (error: Error) => void;
}

export const useAnalytics = (
  filters: FilterState,
  options: UseAnalyticsOptions = {}
): UseAnalyticsState => {
  const {
    useMockData = process.env.NODE_ENV === 'development',
    autoRefresh = true,
    refreshInterval,
    onError
  } = options;

  // Состояние данных
  const [metrics, setMetrics] = useState<MetricCardProps[]>([]);
  const [chartData, setChartData] = useState<{
    lineChart: ApiChartData[];
    pieChart: ApiCategoryData[];
    barChart: ApiChartData[];
  }>({ lineChart: [], pieChart: [], barChart: [] });
  const [tableData, setTableData] = useState<{
    data: ApiTableRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });

  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных
  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      if (useMockData) {
        // Используем моковые данные
        const transformedMetrics = transformApiMetricsToProps(mockAnalyticsData.metrics);
        setMetrics(transformedMetrics);
        
        setChartData({
          lineChart: mockAnalyticsData.chartData,
          pieChart: mockAnalyticsData.categoryData,
          barChart: mockAnalyticsData.chartData
        });
        
        setTableData({
          data: mockAnalyticsData.tableData,
          total: mockAnalyticsData.totalRecords,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(mockAnalyticsData.totalRecords / 10)
        });
      } else {
        // Загружаем данные с API
        const [analyticsData, chartApiData] = await Promise.all([
          analyticsApi.getAnalyticsData(filters),
          analyticsApi.getChartData(filters)
        ]);

        const transformedMetrics = transformApiMetricsToProps(analyticsData.metrics);
        setMetrics(transformedMetrics);
        setChartData(chartApiData);
        
        // Загружаем первую страницу таблицы
        const tableApiData = await analyticsApi.getTableData(filters, 1, 10);
        setTableData(tableApiData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, useMockData, onError]);

  // Обновление данных
  const refreshData = useCallback(async () => {
    await loadData(false);
  }, [loadData]);

  // Загрузка данных таблицы с пагинацией
  const loadTableData = useCallback(async (
    page = 1,
    limit = 10,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    search?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      if (useMockData) {
        // Эмуляция пагинации для моковых данных
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = mockAnalyticsData.tableData.slice(startIndex, endIndex);
        
        setTableData({
          data: paginatedData,
          total: mockAnalyticsData.totalRecords,
          page,
          limit,
          totalPages: Math.ceil(mockAnalyticsData.totalRecords / limit)
        });
      } else {
        const tableApiData = await analyticsApi.getTableData(
          filters,
          page,
          limit,
          sortBy,
          sortOrder,
          search
        );
        setTableData(tableApiData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки данных таблицы';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [filters, useMockData, onError]);

  // Экспорт данных
  const exportData = useCallback(async (format: 'csv' | 'xlsx' | 'pdf' = 'csv') => {
    try {
      setIsExporting(true);
      setError(null);

      if (useMockData) {
        // Эмуляция экспорта для разработки
        const mockData = JSON.stringify(mockAnalyticsData, null, 2);
        const blob = new Blob([mockData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-data.${format === 'csv' ? 'json' : format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const blob = await analyticsApi.exportData(filters, format);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка экспорта данных';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsExporting(false);
    }
  }, [filters, useMockData, onError]);

  // Очистка ошибок
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Автоматическая загрузка данных при изменении фильтров
  useEffect(() => {
    if (autoRefresh) {
      loadData();
    }
  }, [filters, autoRefresh, loadData]);

  // Автообновление данных по интервалу
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, refreshData]);

  return {
    // Данные
    metrics,
    chartData,
    tableData,
    
    // Состояние
    isLoading,
    isRefreshing,
    isExporting,
    error,
    
    // Методы
    refreshData,
    loadTableData,
    exportData,
    clearError
  };
};

export default useAnalytics;