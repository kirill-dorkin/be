import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { ProductStats as ProductStatsType } from './types';
import { ProductUtils } from './utils';

interface ProductStatsProps {
  stats: ProductStatsType;
  loading?: boolean;
}

export const ProductStats: React.FC<ProductStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего продуктов</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            В наличии: {stats.inStockCount}, Нет в наличии: {stats.outOfStockCount}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Общая стоимость</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {ProductUtils.formatPrice(stats.totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Средняя цена: {ProductUtils.formatPrice(stats.averagePrice)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Общий запас</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStock}</div>
          <p className="text-xs text-muted-foreground">
            Единиц товара на складе
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Статус запасов</CardTitle>
          {stats.outOfStockCount > 0 ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.inStockCount}/{stats.totalProducts}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.outOfStockCount > 0 
              ? `${stats.outOfStockCount} товаров закончилось`
              : 'Все товары в наличии'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};