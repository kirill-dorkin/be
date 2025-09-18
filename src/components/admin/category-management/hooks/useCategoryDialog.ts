'use client';

import { useState } from 'react';
import { ICategory } from '@/models/Category';
import { CategoryDialogState, CategoryFormData } from '../types';

export const useCategoryDialog = () => {
  const [dialogState, setDialogState] = useState<CategoryDialogState>({
    isCreateDialogOpen: false,
    isEditDialogOpen: false,
    isViewDialogOpen: false,
    isDeleteDialogOpen: false,
    selectedCategory: null,
    viewingCategory: null
  });

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogState(prev => ({ ...prev, isCreateDialogOpen: true }));
  };

  const openEditDialog = (category: ICategory) => {
    setDialogState(prev => ({ 
      ...prev, 
      selectedCategory: category,
      isEditDialogOpen: true 
    }));
    setFormData({
      name: category.name || '',
      description: '',
      isActive: true
    });
  };

  const openViewDialog = (category: ICategory) => {
    setDialogState(prev => ({ 
      ...prev, 
      viewingCategory: category,
      isViewDialogOpen: true 
    }));
  };

  const openDeleteDialog = (category: ICategory) => {
    setDialogState(prev => ({ 
      ...prev, 
      selectedCategory: category,
      isDeleteDialogOpen: true 
    }));
  };

  const closeAllDialogs = () => {
    setDialogState({
      isCreateDialogOpen: false,
      isEditDialogOpen: false,
      isViewDialogOpen: false,
      isDeleteDialogOpen: false,
      selectedCategory: null,
      viewingCategory: null
    });
    resetForm();
  };

  const updateDialogState = (updates: Partial<CategoryDialogState>) => {
    setDialogState(prev => ({ ...prev, ...updates }));
  };

  return {
    dialogState,
    formData,
    setFormData,
    resetForm,
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    closeAllDialogs,
    updateDialogState
  };
};