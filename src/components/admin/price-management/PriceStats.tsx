'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  Package,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { PriceStats as PriceStatsType } from './types';

interface PriceStatsProps {
  stats: PriceStatsType;
  loading: boolean;
}

export const PriceStats = ({ stats, loading }: PriceStatsProps) => {
  const statsCards = [
    {
      title: 'Всего услуг',
      value: stats.totalServices,
      description: 'Активные услуги',
      icon: Settings,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Всего товаров',
      value: stats.totalProducts,
      description: 'Доступные товары',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Средняя цена услуг',
      value: `${stats.avgServicePrice?.toLocaleString('ru-RU') || 0} ₽`,
      description: 'За услугу',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Средняя цена товаров',
      value: `${stats.avgProductPrice?.toLocaleString('ru-RU') || 0} ₽`,
      description: 'За товар',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Недавние обновления',
      value: stats.recentUpdates,
      description: 'За последние 7 дней',
      icon: RefreshCw,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`h-8 w-8 rounded ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};