import { AlertTriangle, CheckCircle } from 'lucide-react';
import { ProductFormData } from './types';

/**
 * Утилиты для работы с продуктами
 */
export class ProductUtils {
  /**
   * Получение статуса запасов продукта
   */
  static getStockStatus(stock: number) {
    if (stock === 0) {
      return {
        label: 'Нет в наличии',
        variant: 'destructive' as const,
        icon: AlertTriangle
      };
    }
    if (stock < 10) {
      return {
        label: 'Мало',
        variant: 'secondary' as const,
        icon: AlertTriangle
      };
    }
    return {
      label: 'В наличии',
      variant: 'default' as const,
      icon: CheckCircle
    };
  }

  /**
   * Форматирование цены в рублях
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  }

  /**
   * Создание пустой формы продукта
   */
  static createEmptyForm(): ProductFormData {
    return {
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      images: [],
      specifications: {},
      tags: []
    };
  }

  /**
   * Заполнение формы данными продукта для редактирования
   */
  static fillFormFromProduct(product: any): ProductFormData {
    return {
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category._id,
      stock: product.stockQuantity.toString(),
      images: product.images || [],
      specifications: product.specifications || {},
      tags: product.tags || []
    };
  }

  /**
   * Валидация формы продукта
   */
  static validateForm(formData: ProductFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Название продукта обязательно');
    }

    if (!formData.description.trim()) {
      errors.push('Описание продукта обязательно');
    }

    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      errors.push('Цена должна быть положительным числом');
    }

    if (!formData.category) {
      errors.push('Категория обязательна');
    }

    if (!formData.stock || isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      errors.push('Количество на складе должно быть неотрицательным числом');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Фильтрация продуктов по поисковому запросу
   */
  static filterProductsBySearch(products: any[], searchTerm: string) {
    if (!searchTerm.trim()) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.name.toLowerCase().includes(term) ||
      (product.tags && product.tags.some((tag: string) => tag.toLowerCase().includes(term)))
    );
  }

  /**
   * Сортировка продуктов
   */
  static sortProducts(products: any[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') {
    return [...products].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stockQuantity;
          bValue = b.stockQuantity;
          break;
        case 'category':
          aValue = a.category.name.toLowerCase();
          bValue = b.category.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Подсчет статистики продуктов
   */
  static calculateStats(products: any[]) {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stockQuantity), 0);
    const averagePrice = totalProducts > 0 ? products.reduce((sum, product) => sum + product.price, 0) / totalProducts : 0;
    const totalStock = products.reduce((sum, product) => sum + product.stockQuantity, 0);
    const inStockCount = products.filter(product => product.stockQuantity > 0).length;
    const outOfStockCount = products.filter(product => product.stockQuantity === 0).length;

    return {
      totalProducts,
      totalValue,
      averagePrice,
      totalStock,
      inStockCount,
      outOfStockCount
    };
  }

  /**
   * Генерация уникального ID для временных элементов
   */
  static generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Генерация уникального ID для продукта
   */
  static generateProductId(): string {
    return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Быстрая валидация формы продукта
   */
  static validateProductForm(formData: ProductFormData): boolean {
    return !!(formData.name.trim() && 
             formData.category && 
             formData.price > 0 && 
             formData.stock >= 0);
  }

  /**
   * Создание пустой формы
   */
  static createEmptyForm(): ProductFormData {
    return {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      sku: '',
      images: [],
      specifications: [],
      tags: []
    };
  }

  /**
   * Заполнение формы данными продукта
   */
  static fillFormFromProduct(product: ProductWithStats): ProductFormData {
    return {
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category as string,
      sku: product.sku || '',
      images: product.images || [],
      specifications: product.specifications || [],
      tags: product.tags || []
    };
  }

  /**
   * Проверка валидности URL изображения
   */
  static isValidImageUrl(url: string): boolean {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    } catch {
      return false;
    }
  }

  /**
   * Очистка и нормализация тегов
   */
  static normalizeTags(tags: string[]): string[] {
    return tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .filter((tag, index, array) => array.indexOf(tag) === index); // удаление дубликатов
  }
}