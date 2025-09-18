import { useState, useEffect, useCallback } from 'react';
import { ICategory } from '@/models/Category';
import { ProductWithStats, ProductFormData, ProductStats, ProductFilters, ProductPagination, BulkAction, BulkActionData } from './types';
import { ProductAPI } from './api';
import { ProductUtils } from './utils';

/**
 * Хук для управления продуктами
 */
export const useProductManagement = (
  initialProducts: ProductWithStats[] = [],
  initialCategories: ICategory[] = []
) => {
  // Состояние продуктов и категорий
  const [products, setProducts] = useState<ProductWithStats[]>(initialProducts);
  const [categories, setCategories] = useState<ICategory[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    totalValue: 0,
    averagePrice: 0,
    totalStock: 0,
    inStockCount: 0,
    outOfStockCount: 0
  });

  // Состояние фильтров
  const [filters, setFilters] = useState<ProductFilters>({
    searchTerm: '',
    categoryFilter: 'all',
    stockFilter: 'all',
    priceRange: { min: '', max: '' }
  });

  // Состояние пагинации
  const [pagination, setPagination] = useState<ProductPagination>({
    currentPage: 1,
    totalPages: 1,
    limit: 10
  });

  // Состояние выбранных продуктов
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  /**
   * Загрузка продуктов
   */
  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await ProductAPI.fetchProducts(filters, { ...pagination, currentPage: page });
      if (result) {
        setProducts(result.products);
        setStats(result.stats);
        setPagination(prev => ({
          ...prev,
          currentPage: result.pagination.page,
          totalPages: result.pagination.pages
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  /**
   * Загрузка категорий
   */
  const fetchCategories = useCallback(async () => {
    const fetchedCategories = await ProductAPI.fetchCategories();
    setCategories(fetchedCategories);
  }, []);

  /**
   * Создание продукта
   */
  const createProduct = async (formData: ProductFormData): Promise<boolean> => {
    const validation = ProductUtils.validateForm(formData);
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      return false;
    }

    const success = await ProductAPI.createProduct(formData);
    if (success) {
      await fetchProducts(pagination.currentPage);
    }
    return success;
  };

  /**
   * Обновление продукта
   */
  const updateProduct = async (productId: string, formData: ProductFormData): Promise<boolean> => {
    const validation = ProductUtils.validateForm(formData);
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      return false;
    }

    const success = await ProductAPI.updateProduct(productId, formData);
    if (success) {
      await fetchProducts(pagination.currentPage);
    }
    return success;
  };

  /**
   * Удаление продукта
   */
  const deleteProduct = async (productId: string): Promise<boolean> => {
    const success = await ProductAPI.deleteProduct(productId);
    if (success) {
      await fetchProducts(pagination.currentPage);
    }
    return success;
  };

  /**
   * Массовые операции
   */
  const performBulkAction = async (action: BulkAction, data?: BulkActionData): Promise<boolean> => {
    const success = await ProductAPI.bulkAction(action, selectedProducts, data);
    if (success) {
      setSelectedProducts([]);
      await fetchProducts(pagination.currentPage);
    }
    return success;
  };

  /**
   * Обновление фильтров
   */
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Сброс на первую страницу при изменении фильтров
  };

  /**
   * Переход на страницу
   */
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchProducts(page);
    }
  };

  /**
   * Выбор/снятие выбора продукта
   */
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  /**
   * Выбор/снятие выбора всех продуктов
   */
  const toggleAllProductsSelection = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id as string));
    }
  };

  /**
   * Очистка выбора
   */
  const clearSelection = () => {
    setSelectedProducts([]);
  };

  // Эффекты
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    // Данные
    products,
    categories,
    stats,
    loading,
    filters,
    pagination,
    selectedProducts,
    
    // Действия
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    performBulkAction,
    updateFilters,
    goToPage,
    toggleProductSelection,
    toggleAllProductsSelection,
    clearSelection,
    
    // Вычисляемые значения
    hasSelectedProducts: selectedProducts.length > 0,
    allProductsSelected: selectedProducts.length === products.length && products.length > 0,
    someProductsSelected: selectedProducts.length > 0 && selectedProducts.length < products.length,
    
    // Дополнительные методы
    setFilters: updateFilters,
    setSelectedProducts: (products: string[]) => {
      setSelectedProducts(products);
    },
    refreshProducts: fetchProducts,
    handleCreateProduct: async (data: ProductFormData) => {
      await ProductAPI.createProduct(data);
      fetchProducts();
    },
    handleUpdateProduct: async (id: string, data: ProductFormData) => {
      await ProductAPI.updateProduct(id, data);
      fetchProducts();
    },
    handleDeleteProduct: async (id: string) => {
      await ProductAPI.deleteProduct(id);
      fetchProducts();
    },
    handleBulkAction: async (action: string, productIds: string[]) => {
      await ProductAPI.bulkAction(action as any, productIds);
      fetchProducts();
    },
    updatePagination: setPagination,
    selectProduct: toggleProductSelection,
    selectAllProducts: toggleAllProductsSelection,
    toggleSelectAll: toggleAllProductsSelection
  };
};

/**
 * Хук для управления формой продукта
 */
export const useProductForm = (initialData?: ProductWithStats) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithStats | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(
    initialData ? ProductUtils.fillFormFromProduct(initialData) : ProductUtils.createEmptyForm()
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newTag, setNewTag] = useState('');

  /**
   * Обновление поля формы
   */
  const updateField = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Сброс формы
   */
  const resetForm = () => {
    setFormData(ProductUtils.createEmptyForm());
    setNewImageUrl('');
    setNewSpecKey('');
    setNewSpecValue('');
    setNewTag('');
  };

  /**
   * Заполнение формы данными продукта
   */
  const fillForm = (product: ProductWithStats) => {
    setFormData(ProductUtils.fillFormFromProduct(product));
  };

  /**
   * Добавление изображения
   */
  const addImage = () => {
    if (newImageUrl.trim() && ProductUtils.isValidImageUrl(newImageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  /**
   * Удаление изображения
   */
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  /**
   * Добавление спецификации
   */
  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim()
        }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  /**
   * Удаление спецификации
   */
  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  /**
   * Добавление тега
   */
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  /**
   * Удаление тега
   */
  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  /**
   * Валидация формы
   */
  const validateForm = () => {
    return ProductUtils.validateForm(formData);
  };

  return {
    formData,
    isDialogOpen,
    editingProduct,
    newImageUrl,
    newSpecKey,
    newSpecValue,
    newTag,
    setFormData: updateField,
    setIsDialogOpen,
    setEditingProduct,
    setNewImageUrl,
    setNewSpecKey,
    setNewSpecValue,
    setNewTag,
    updateField,
    updateFormData: updateField,
    resetForm: () => {
      setFormData(ProductUtils.createEmptyForm());
      setEditingProduct(null);
      setNewImageUrl('');
      setNewSpecKey('');
      setNewSpecValue('');
      setNewTag('');
    },
    fillForm,
    openEditDialog: (product: ProductWithStats) => {
      setEditingProduct(product);
      setFormData(ProductUtils.fillFormFromProduct(product));
      setIsDialogOpen(true);
    },
    addImage,
    removeImage,
    addSpecification,
    removeSpecification,
    addTag,
    removeTag,
    validateForm
  };
};