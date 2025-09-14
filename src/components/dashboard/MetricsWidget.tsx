'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RiArrowUpLine,
  RiArrowDownLine,
  RiTaskLine,
  RiUserLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiBarChartLine
} from 'react-icons/ri';

interface MetricData {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ReactNode;
  color: string;
  description?: string;
}

interface MetricsWidgetProps {
  className?: string;
}

const MetricsWidget: React.FC<MetricsWidgetProps> = ({ className = '' }) => {
  // Моковые данные метрик (в реальном приложении будут приходить через props)
  const metrics: MetricData[] = [
    {
      id: 'total-tasks',
      title: 'Всего задач',
      value: 247,
      change: {
        value: 12,
        type: 'increase',
        period: 'за неделю'
      },
      icon: <RiTaskLine className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: 'Общее количество задач в системе'
    },
    {
      id: 'completed-tasks',
      title: 'Выполнено',
      value: 189,
      change: {
        value: 8,
        type: 'increase',
        period: 'за неделю'
      },
      icon: <RiCheckboxCircleLine className="w-6 h-6" />,
      color: 'bg-green-500',
      description: 'Завершенные задачи'
    },
    {
      id: 'active-users',
      title: 'Активные пользователи',
      value: 42,
      change: {
        value: 3,
        type: 'increase',
        period: 'за день'
      },
      icon: <RiUserLine className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: 'Пользователи онлайн'
    },
    {
      id: 'avg-completion',
      title: 'Среднее время',
      value: '2.4ч',
      change: {
        value: 15,
        type: 'decrease',
        period: 'за месяц'
      },
      icon: <RiTimeLine className="w-6 h-6" />,
      color: 'bg-orange-500',
      description: 'Среднее время выполнения задач'
    },
    {
      id: 'efficiency',
      title: 'Эффективность',
      value: '94%',
      change: {
        value: 2,
        type: 'increase',
        period: 'за месяц'
      },
      icon: <RiArrowUpLine className="w-6 h-6" />,
      color: 'bg-indigo-500',
      description: 'Общая эффективность команды'
    },
    {
      id: 'productivity',
      title: 'Продуктивность',
      value: 87,
      change: {
        value: 5,
        type: 'increase',
        period: 'за неделю'
      },
      icon: <RiBarChartLine className="w-6 h-6" />,
      color: 'bg-teal-500',
      description: 'Индекс продуктивности'
    }
  ];

  const formatChangeValue = (change: MetricData['change']) => {
    if (!change) return null;
    
    const sign = change.type === 'increase' ? '+' : '-';
    const colorClass = change.type === 'increase' ? 'text-green-600' : 'text-red-600';
    const IconComponent = change.type === 'increase' ? RiArrowUpLine : RiArrowDownLine;
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <IconComponent className="w-4 h-4" />
        <span className="text-sm font-medium">
          {sign}{change.value}% {change.period}
        </span>
      </div>
    );
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
      {metrics.map((metric) => (
        <Card key={metric.id} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-200">
          {/* Цветная полоска сверху */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${metric.color}`} />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.color} text-white`}>
              {metric.icon}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              {/* Основное значение */}
              <div className="text-2xl font-bold text-gray-900">
                {metric.value}
              </div>
              
              {/* Изменение */}
              {metric.change && (
                <div className="flex items-center justify-between">
                  {formatChangeValue(metric.change)}
                </div>
              )}
              
              {/* Описание */}
              {metric.description && (
                <p className="text-xs text-gray-500 mt-2">
                  {metric.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsWidget;