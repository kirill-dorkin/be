import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { IService, ServiceFormData } from './types';
import { useCategories } from './hooks';
import { validateServiceForm } from './utils';

interface ServiceFormProps {
  service?: IService;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { categories } = useCategories();
  const [formData, setFormData] = useState<ServiceFormData>({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
    duration: service?.duration || 0,
    category: service?.category || '',
    isActive: service?.isActive ?? true,
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        isActive: service.isActive,
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateServiceForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <ul className="text-sm text-red-600 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Название услуги</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Введите название услуги"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Введите описание услуги"
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Цена (сом)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', Number(e.target.value))}
            placeholder="0"
            min="0"
            step="1"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Длительность (мин)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', Number(e.target.value))}
            placeholder="0"
            min="1"
            step="1"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Категория</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleInputChange('category', value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => handleInputChange('isActive', checked)}
          disabled={isLoading}
        />
        <Label>Активная услуга</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Сохранение...' : service ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;