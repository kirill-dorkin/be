import { ICategory } from './types';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KGS',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDuration = (duration: number): string => {
  if (duration < 60) {
    return `${duration} мин`;
  }
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  if (minutes === 0) {
    return `${hours} ч`;
  }
  return `${hours} ч ${minutes} мин`;
};

export const getCategoryName = (categoryId: string, categories: ICategory[]): string => {
  const category = categories.find(cat => cat._id === categoryId);
  return category ? category.name : 'Неизвестная категория';
};

export const validateServiceForm = (formData: any): string[] => {
  const errors: string[] = [];
  
  if (!formData.name?.trim()) {
    errors.push('Название услуги обязательно');
  }
  
  if (!formData.description?.trim()) {
    errors.push('Описание услуги обязательно');
  }
  
  if (!formData.price || formData.price <= 0) {
    errors.push('Цена должна быть больше 0');
  }
  
  if (!formData.duration || formData.duration <= 0) {
    errors.push('Длительность должна быть больше 0');
  }
  
  if (!formData.category) {
    errors.push('Категория обязательна');
  }
  
  return errors;
};