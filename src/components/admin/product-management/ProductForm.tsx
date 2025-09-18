import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Upload, Trash2 } from 'lucide-react';
import { ICategory } from '@/models/Category';
import { ProductFormData } from './types';
import { ProductUtils } from './utils';

interface ProductFormProps {
  formData: ProductFormData;
  categories: ICategory[];
  onFormDataChange: (data: Partial<ProductFormData>) => void;
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
  onAddSpecification: () => void;
  onRemoveSpecification: (index: number) => void;
  onAddTag: () => void;
  onRemoveTag: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  categories,
  onFormDataChange,
  onAddImage,
  onRemoveImage,
  onAddSpecification,
  onRemoveSpecification,
  onAddTag,
  onRemoveTag,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false
}) => {
  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    onFormDataChange({ [field]: value });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    onFormDataChange({ images: newImages });
  };

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    onFormDataChange({ specifications: newSpecs });
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    onFormDataChange({ tags: newTags });
  };

  const isFormValid = ProductUtils.validateProductForm(formData);

  return (
    <div className="space-y-6">
      {/* Основная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Введите название продукта"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Категория *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id as string} value={category._id as string}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Введите описание продукта"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Цена *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price.toString()}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Количество *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock.toString()}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="Артикул товара"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Изображения */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Изображения</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddImage}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent>
          {formData.images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p>Нет изображений</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="URL изображения"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Характеристики */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Характеристики</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddSpecification}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent>
          {formData.specifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Нет характеристик</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={spec.key}
                    onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                    placeholder="Название характеристики"
                    className="flex-1"
                  />
                  <Input
                    value={spec.value}
                    onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                    placeholder="Значение"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveSpecification(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Теги */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Теги</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddTag}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent>
          {formData.tags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Нет тегов</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    placeholder="Тег"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveTag(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {formData.tags.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Предпросмотр тегов:</p>
              <div className="flex flex-wrap gap-1">
                {formData.tags.filter(tag => tag.trim()).map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={loading || !isFormValid}
        >
          {loading ? 'Сохранение...' : (isEdit ? 'Обновить' : 'Создать')}
        </Button>
      </div>
    </div>
  );
};