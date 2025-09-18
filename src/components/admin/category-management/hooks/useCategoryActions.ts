import { toast } from 'sonner';
import { ICategory } from '@/models/Category';
import { CategoryFormData } from '../types';

export const useCategoryActions = () => {
  const createCategory = async (formData: CategoryFormData) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Категория успешно создана');
        return true;
      } else {
        toast.error(data.error || 'Ошибка при создании категории');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при создании категории:', error);
      toast.error('Ошибка при создании категории');
      return false;
    }
  };

  const updateCategory = async (categoryId: string, formData: CategoryFormData) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Категория успешно обновлена');
        return true;
      } else {
        toast.error(data.error || 'Ошибка при обновлении категории');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при обновлении категории:', error);
      toast.error('Ошибка при обновлении категории');
      return false;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Категория успешно удалена');
        return true;
      } else {
        toast.error(data.error || 'Ошибка при удалении категории');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
      toast.error('Ошибка при удалении категории');
      return false;
    }
  };

  return {
    createCategory,
    updateCategory,
    deleteCategory
  };
};