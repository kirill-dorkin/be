'use client';

import React, { useState } from 'react';
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

export interface FilterState {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  period: string;
  metric: string;
  category: string;
}

interface AnalyticsFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
}

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Сегодня' },
  { value: 'yesterday', label: 'Вчера' },
  { value: 'last7days', label: 'Последние 7 дней' },
  { value: 'last30days', label: 'Последние 30 дней' },
  { value: 'thisMonth', label: 'Этот месяц' },
  { value: 'lastMonth', label: 'Прошлый месяц' },
  { value: 'thisYear', label: 'Этот год' },
  { value: 'custom', label: 'Настраиваемый период' },
];

const METRIC_OPTIONS = [
  { value: 'all', label: 'Все метрики' },
  { value: 'revenue', label: 'Выручка' },
  { value: 'orders', label: 'Заказы' },
  { value: 'users', label: 'Пользователи' },
  { value: 'conversion', label: 'Конверсия' },
  { value: 'traffic', label: 'Трафик' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Все категории' },
  { value: 'sales', label: 'Продажи' },
  { value: 'marketing', label: 'Маркетинг' },
  { value: 'users', label: 'Пользователи' },
  { value: 'products', label: 'Товары' },
];

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  onExport,
  isLoading = false
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handlePeriodChange = (period: string) => {
    const newFilters = { ...filters, period };
    
    // Автоматически устанавливаем даты для предустановленных периодов
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    switch (period) {
      case 'today':
        newFilters.dateRange = { from: today, to: today };
        break;
      case 'yesterday':
        newFilters.dateRange = { from: yesterday, to: yesterday };
        break;
      case 'last7days':
        const last7days = new Date(today);
        last7days.setDate(last7days.getDate() - 7);
        newFilters.dateRange = { from: last7days, to: today };
        break;
      case 'last30days':
        const last30days = new Date(today);
        last30days.setDate(last30days.getDate() - 30);
        newFilters.dateRange = { from: last30days, to: today };
        break;
      case 'thisMonth':
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        newFilters.dateRange = { from: thisMonthStart, to: today };
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        newFilters.dateRange = { from: lastMonthStart, to: lastMonthEnd };
        break;
      case 'thisYear':
        const thisYearStart = new Date(today.getFullYear(), 0, 1);
        newFilters.dateRange = { from: thisYearStart, to: today };
        break;
    }
    
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (range: DateRange) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        from: range?.from,
        to: range?.to
      },
      period: 'custom'
    });
  };

  const formatDateRange = () => {
    if (!filters.dateRange.from) return 'Выберите период';
    if (!filters.dateRange.to) return format(filters.dateRange.from, 'dd MMM yyyy', { locale: ru });
    return `${format(filters.dateRange.from, 'dd MMM', { locale: ru })} - ${format(filters.dateRange.to, 'dd MMM yyyy', { locale: ru })}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
      {/* Мобильная версия - вертикальное расположение */}
      <div className="flex flex-col space-y-4 lg:hidden">
        {/* Первая строка - основные фильтры */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Период
            </label>
            <Select value={filters.period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите период" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Метрика
            </label>
            <Select
              value={filters.metric}
              onValueChange={(metric) => onFiltersChange({ ...filters, metric })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Метрика" />
              </SelectTrigger>
              <SelectContent>
                {METRIC_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Вторая строка - категория */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Категория
          </label>
          <Select
            value={filters.category}
            onValueChange={(category) => onFiltersChange({ ...filters, category })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Кастомные даты для мобильных */}
        {filters.period === 'custom' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Даты
            </label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal min-h-[44px]"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to
                  }}
                  onSelect={(range) => {
                    if (range) {
                      handleDateRangeChange(range);
                    }
                  }}
                  numberOfMonths={1}
                  locale={ru}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Кнопки действий для мобильных */}
        <div className="flex flex-col sm:flex-row gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Экспорт
            </Button>
          )}
        </div>
      </div>

      {/* Десктопная версия - горизонтальное расположение */}
      <div className="hidden lg:flex lg:flex-row lg:gap-4 lg:items-start lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Период */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Период
            </label>
            <Select value={filters.period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Выберите период" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Календарь для настраиваемого периода */}
          {filters.period === 'custom' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Даты
              </label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[250px] justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to
                    }}
                    onSelect={(range) => {
                      if (range) {
                        handleDateRangeChange(range);
                      }
                    }}
                    numberOfMonths={2}
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Метрика */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Метрика
            </label>
            <Select
              value={filters.metric}
              onValueChange={(metric) => onFiltersChange({ ...filters, metric })}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Метрика" />
              </SelectTrigger>
              <SelectContent>
                {METRIC_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Категория */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Категория
            </label>
            <Select
              value={filters.category}
              onValueChange={(category) => onFiltersChange({ ...filters, category })}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Действия */}
        <div className="flex gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Экспорт
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};