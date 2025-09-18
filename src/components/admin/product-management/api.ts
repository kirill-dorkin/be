import { toast } from '@/hooks/use-toast';
import { ProductFormData, ProductWithStats, ProductStats, BulkAction, BulkActionData, ProductFilters, ProductPagination } from './types';

export class ProductAPI {
  /**
   * Загрузка продуктов с фильтрацией и пагинацией
   */
  static async fetchProducts(
    filters: ProductFilters,
    pagination: ProductPagination
  ): Promise<{
    products: ProductWithStats[];
    stats: ProductStats;
    pagination: { page: number; pages: number };
  } | null> {
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        search: filters.searchTerm,
        category: filters.categoryFilter === 'all' ? '' : filters.categoryFilter,
        inStock: filters.stockFilter === 'all' ? '' : filters.stockFilter,
        minPrice: filters.priceRange.min,
        maxPrice: filters.priceRange.max,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      if (data.success) {
        return {
          products: data.products,
          stats: data.stats,
          pagination: data.pagination
        };
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось загрузить продукты',
          variant: 'destructive'
        });
        return null;
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети при загрузке продуктов',
        variant: 'destructive'
      });
      return null;
    }
  }

  /**
   * Создание нового продукта
   */
  static async createProduct(formData: ProductFormData): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успех',
          description: 'Продукт успешно создан',
        });
        return true;
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать продукт',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети при создании продукта',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Обновление продукта
   */
  static async updateProduct(productId: string, formData: ProductFormData): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успех',
          description: 'Продукт успешно обновлен',
        });
        return true;
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить продукт',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети при обновлении продукта',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Удаление продукта
   */
  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успех',
          description: 'Продукт успешно удален',
        });
        return true;
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось удалить продукт',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети при удалении продукта',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Массовые операции с продуктами
   */
  static async bulkAction(
    action: BulkAction,
    productIds: string[],
    data?: BulkActionData
  ): Promise<boolean> {
    if (productIds.length === 0) return false;

    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          productIds,
          data
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Успех',
          description: result.message,
        });
        return true;
      } else {
        toast({
          title: 'Ошибка',
          description: result.error || 'Не удалось выполнить операцию',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети при выполнении операции',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Загрузка категорий
   */
  static async fetchCategories() {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        return data.categories;
      }
      return [];
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
      return [];
    }
  }
}