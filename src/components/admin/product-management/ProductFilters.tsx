import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, RefreshCw, X } from 'lucide-react';
import { ICategory } from '@/models/Category';
import { ProductFilters as ProductFiltersType } from './types';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  categories: ICategory[];
  onFiltersChange: (filters: Partial<ProductFiltersType>) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  categories,
  onFiltersChange,
  onRefresh,
  loading = false
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ searchTerm: value });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ categoryFilter: value });
  };

  const handleStockChange = (value: string) => {
    onFiltersChange({ stockFilter: value });
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    onFiltersChange({
      priceRange: {
        ...filters.priceRange,
        [field]: value
      }
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      categoryFilter: 'all',
      stockFilter: 'all',
      priceRange: { min: '', max: '' }
    });
  };

  const hasActiveFilters = 
    filters.searchTerm ||
    filters.categoryFilter !== 'all' ||
    filters.stockFilter !== 'all' ||
    filters.priceRange.min ||
    filters.priceRange.max;

  return (
    <div className="space-y-4">
      {/* Поиск */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск продуктов..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="px-3"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Категория */}
        <div>
          <label className="text-sm font-medium mb-1 block">Категория</label>
          <Select value={filters.categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id as string} value={category._id as string}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Наличие */}
        <div>
          <label className="text-sm font-medium mb-1 block">Наличие</label>
          <Select value={filters.stockFilter} onValueChange={handleStockChange}>
            <SelectTrigger>
              <SelectValue placeholder="Все товары" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все товары</SelectItem>
              <SelectItem value="inStock">В наличии</SelectItem>
              <SelectItem value="outOfStock">Нет в наличии</SelectItem>
              <SelectItem value="lowStock">Мало на складе</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Минимальная цена */}
        <div>
          <label className="text-sm font-medium mb-1 block">Мин. цена</label>
          <Input
            type="number"
            placeholder="0"
            value={filters.priceRange.min}
            onChange={(e) => handlePriceRangeChange('min', e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        {/* Максимальная цена */}
        <div>
          <label className="text-sm font-medium mb-1 block">Макс. цена</label>
          <Input
            type="number"
            placeholder="∞"
            value={filters.priceRange.max}
            onChange={(e) => handlePriceRangeChange('max', e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Очистка фильтров */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Очистить фильтры
          </Button>
        </div>
      )}
    </div>
  );
};