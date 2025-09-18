export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  servicesCount: number;
  productsCount: number;
}

export interface CategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
}

export interface CategoryDialogState {
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isViewDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedCategory: any | null;
  viewingCategory: any | null;
}