import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderStats as OrderStatsType } from '../types';
// Utility function for currency formatting
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount);
};

interface OrderStatsProps {
  stats: OrderStatsType;
  loading: boolean;
}

export const OrderStats: React.FC<OrderStatsProps> = ({ stats, loading }) => {
  const statCards = [
    {
      title: 'Всего заказов',
      value: stats.total,
      color: 'default' as const
    },
    {
      title: 'В ожидании',
      value: stats.pending,
      color: 'secondary' as const
    },
    {
      title: 'В обработке',
      value: stats.processing,
      color: 'default' as const
    },
    {
      title: 'Отправлено',
      value: stats.shipped,
      color: 'default' as const
    },
    {
      title: 'Доставлено',
      value: stats.delivered,
      color: 'default' as const
    },
    {
      title: 'Отменено',
      value: stats.cancelled,
      color: 'destructive' as const
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={stat.color} className="text-lg font-bold">
                {stat.value}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общая выручка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Средний чек
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.averageOrderValue)}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};