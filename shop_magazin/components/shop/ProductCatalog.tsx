'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import { Search, Filter, Grid, List } from 'lucide-react';
import { IProduct } from '@/models/Product';
import useCustomToast from '@/hooks/useCustomToast';

interface ProductCatalogProps {
  initialProducts?: IProduct[];
  categories?: string[];
  className?: string;
}

interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export default function ProductCatalog({
  initialProducts = [],
  categories = [],
  className = ''
}: ProductCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Фильтры
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sortBy: (searchParams.get('sortBy') as 'name' | 'price' | 'createdAt') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12')
  });

  // Загрузка товаров
  const fetchProducts = useCallback(async (newFilters: ProductFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null && value !== 'all') {
          params.append(key, String(value));
        }
      });
      
      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке товаров');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
      
      // Обновляем URL
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    } catch (error) {
      console.error('Error fetching products:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось загрузить товары'
      });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProducts, setTotalPages, setCurrentPage, showErrorToast]);

  // Обновление фильтров
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchProducts(updatedFilters);
  };

  // Изменение страницы
  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchProducts(updatedFilters);
  };

  // Добавление в корзину
  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        })
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при добавлении в корзину');
      }
      
      showSuccessToast({
        title: 'Успех',
        description: 'Товар добавлен в корзину'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось добавить товар в корзину'
      });
    }
  };

  // Просмотр деталей товара
  const handleViewDetails = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  // Сброс фильтров
  const resetFilters = () => {
    const defaultFilters: ProductFilters = {
      search: '',
      category: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 12
    };
    setFilters(defaultFilters);
    fetchProducts(defaultFilters);
  };

  // Загрузка при монтировании
  useEffect(() => {
    if (initialProducts.length === 0) {
      fetchProducts(filters);
    }
  }, [fetchProducts, filters, initialProducts.length]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Фильтры и поиск */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры и поиск
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск товаров..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            {/* Категория */}
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => updateFilters({ category: value === 'all' ? '' : value })}
            >              <SelectTrigger>                <SelectValue placeholder="Все категории" />              </SelectTrigger>              <SelectContent>                <SelectItem value="all">Все категории</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Сортировка */}
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-') as ['name' | 'price' | 'createdAt', 'asc' | 'desc'];
                updateFilters({ sortBy, sortOrder });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Новые первыми</SelectItem>
                <SelectItem value="createdAt-asc">Старые первыми</SelectItem>
                <SelectItem value="name-asc">По названию (А-Я)</SelectItem>
                <SelectItem value="name-desc">По названию (Я-А)</SelectItem>
                <SelectItem value="price-asc">Дешевые первыми</SelectItem>
                <SelectItem value="price-desc">Дорогие первыми</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Кнопки управления */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex-1"
              >
                Сбросить
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Результаты */}
      <div className="space-y-4">
        {/* Информация о результатах */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading ? 'Загрузка...' : `Найдено товаров: ${products.length}`}
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-gray-600">
              Страница {currentPage} из {totalPages}
            </p>
          )}
        </div>

        {/* Товары */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Товары не найдены</p>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="mt-4"
            >
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {products.map((product) => (
              <ProductCard
                key={String(product._id)}
                product={product}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
                className={viewMode === 'list' ? 'flex-row' : ''}
              />
            ))}
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Предыдущая
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, currentPage - 2) + i;
              if (page > totalPages) return null;
              
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Следующая
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}