import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen, Activity, Tag, Package } from 'lucide-react';
import { CategoryStats as CategoryStatsType } from './types';

interface CategoryStatsProps {
  stats: CategoryStatsType;
}

export const CategoryStats = ({ stats }: CategoryStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Всего категорий</p>
              <p className="text-2xl font-bold">{stats.totalCategories}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Активные</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeCategories}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Услуг</p>
              <p className="text-2xl font-bold text-purple-600">{stats.servicesCount}</p>
            </div>
            <Tag className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Товаров</p>
              <p className="text-2xl font-bold text-orange-600">{stats.productsCount}</p>
            </div>
            <Package className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};