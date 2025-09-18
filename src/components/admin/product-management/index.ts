// Основной компонент
export { default as ProductManagement } from './ProductManagement';
export { ProductManagement as ProductManagementComponent } from './ProductManagement';

// Подкомпоненты
export { ProductStats as ProductStatsComponent } from './ProductStats';
export { ProductFilters as ProductFiltersComponent } from './ProductFilters';
export { ProductForm } from './ProductForm';

// Хуки
export { useProductManagement, useProductForm } from './hooks';

// Утилиты
export { ProductAPI } from './api';
export { ProductUtils } from './utils';

// Типы
export type {
  ProductWithStats,
  ProductManagementProps,
  ProductFormData,
  ProductStats as ProductStatsType,
  BulkAction,
  BulkActionData,
  ProductFilters as ProductFiltersType,
  ProductPagination
} from './types';