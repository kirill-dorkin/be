import { IProduct } from '@/models/Product';
import { ICategory } from '@/models/Category';

export interface ProductWithStats extends Omit<IProduct, 'category'> {
  category: {
    _id: string;
    name: string;
  };
  salesCount?: number;
  revenue?: number;
}

export interface ProductManagementProps {
  initialProducts?: ProductWithStats[];
  initialCategories?: ICategory[];
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  images: string[];
  specifications: { key: string; value: string }[];
  tags: string[];
}

export interface ProductStats {
  totalProducts: number;
  totalValue: number;
  averagePrice: number;
  totalStock: number;
  inStockCount: number;
  outOfStockCount: number;
}

export type BulkAction = 'delete' | 'updateCategory' | 'updateStatus' | 'updatePrice';

export interface BulkActionData {
  category?: string;
  status?: 'active' | 'inactive';
  priceMultiplier?: number;
}

export interface ProductFilters {
  searchTerm: string;
  categoryFilter: string;
  stockFilter: string;
  priceRange: { min: string; max: string };
}

export interface ProductPagination {
  currentPage: number;
  totalPages: number;
  limit: number;
}