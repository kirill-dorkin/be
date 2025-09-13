'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Package, 
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';
import { IProduct } from '@/models/Product';
import useCustomToast from '@/hooks/useCustomToast';
import Spinner from '@/components/ui/spinner';
import { useTranslations } from 'next-intl';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  images: string[];
  inStock: boolean;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  category: '',
  stockQuantity: 0,
  images: [],
  inStock: true
};

export default function ProductManagement() {
  const t = useTranslations('productManagement');
  const { showSuccessToast, showErrorToast } = useCustomToast();
  
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [imageInput, setImageInput] = useState('');

  // Загрузка товаров
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(t('messages.loadErrorDescription'));
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showErrorToast({
        title: t('messages.loadError'),
        description: t('messages.loadErrorDescription')
      });
    } finally {
      setLoading(false);
    }
  }, [showErrorToast, t]);

  // Фильтрация товаров
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Обработка изменений в форме
  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Добавление изображения
  const addImage = () => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  // Удаление изображения
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Открытие формы для создания
  const openCreateForm = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setShowForm(true);
  };

  // Открытие формы для редактирования
  const openEditForm = (product: IProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stockQuantity: product.stockQuantity,
      images: product.images || [],
      inStock: product.inStock
    });
    setShowForm(true);
  };

  // Закрытие формы
  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(initialFormData);
    setImageInput('');
  };

  // Сохранение товара
  const saveProduct = async () => {
    if (!formData.name.trim() || !formData.category.trim() || formData.price <= 0) {
      showErrorToast({
        title: t('messages.validationError'),
        description: t('messages.validationErrorDescription')
      });
      return;
    }

    setSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(editingProduct ? t('messages.updateErrorDescription') : t('messages.createErrorDescription'));
      }
      
      const savedProduct = await response.json();
      
      if (editingProduct) {
        setProducts(prev => 
          prev.map(p => p._id === editingProduct._id ? savedProduct : p)
        );
        showSuccessToast({
          title: t('messages.success'),
          description: t('messages.productUpdated')
        });
      } else {
        setProducts(prev => [savedProduct, ...prev]);
        showSuccessToast({
          title: t('messages.success'),
          description: t('messages.productCreated')
        });
      }
      
      closeForm();
    } catch (error) {
      console.error('Error saving product:', error);
      showErrorToast({
        title: editingProduct ? t('messages.updateError') : t('messages.createError'),
        description: editingProduct ? t('messages.updateErrorDescription') : t('messages.createErrorDescription')
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Удаление товара
  const deleteProduct = async (product: IProduct) => {
    if (!confirm(`${t('messages.deleteConfirm')} "${product.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(t('messages.deleteErrorDescription'));
      }
      
      setProducts(prev => prev.filter(p => p._id !== product._id));
      
      showSuccessToast({
        title: t('messages.success'),
        description: t('messages.productDeleted')
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      showErrorToast({
        title: t('messages.deleteError'),
        description: t('messages.deleteErrorDescription')
      });
    }
  };

  // Переключение активности товара
  const toggleProductStatus = async (product: IProduct) => {
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...product,
          inStock: !product.inStock
        })
      });
      
      if (!response.ok) {
        throw new Error(t('messages.statusErrorDescription'));
      }
      
      const updatedProduct = await response.json();
      
      setProducts(prev => 
        prev.map(p => p._id === product._id ? updatedProduct : p)
      );
      
      showSuccessToast({
        title: t('messages.success'),
        description: `${t('title')} ${updatedProduct.inStock ? t('messages.productActivated') : t('messages.productDeactivated')}`
      });
    } catch (error) {
      console.error('Error toggling product status:', error);
      showErrorToast({
        title: t('messages.statusError'),
        description: t('messages.statusErrorDescription')
      });
    }
  };

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        
        <Button onClick={openCreateForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('addProduct')}
        </Button>
      </div>

      {/* Поиск */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Список товаров */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={String(product._id)} className="overflow-hidden">
            <div className="relative h-48">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Статус товара */}
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleProductStatus(product)}
                  className={`${product.inStock ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                >
                  {product.inStock ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('labels.category')}</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('labels.inStock')}</span>
                  <span className="font-medium">{product.stockQuantity} {t('labels.pieces')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(product)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      {t('editProduct')}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleProductStatus(product)}
                      className={`flex items-center gap-1 ${
                        product.inStock 
                          ? 'text-orange-600 border-orange-600 hover:bg-orange-50' 
                          : 'text-green-600 border-green-600 hover:bg-green-50'
                      }`}
                    >
                      {product.inStock ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          {t('deactivateProduct')}
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          {t('activateProduct')}
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product)}
                      className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      {t('deleteProduct')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
                <Package className="h-16 w-16 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {searchTerm ? t('noProductsFound') : t('noProducts')}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? t('noProductsFoundDescription') : t('noProductsDescription')}
                  </p>
                </div>
                {!searchTerm && (
                  <Button onClick={openCreateForm}>
                    {t('addProduct')}
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Модальное окно формы */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingProduct ? t('editProduct') : t('addProduct')}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={closeForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Название */}
              <div>
                <Label htmlFor="name">{t('form.name')} {t('form.required')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('form.namePlaceholder')}
                />
              </div>
              
              {/* Описание */}
              <div>
                <Label htmlFor="description">{t('form.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('form.descriptionPlaceholder')}
                  rows={3}
                />
              </div>
              
              {/* Цена и количество */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">{t('form.price')} {t('form.required')}</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="stockQuantity">{t('form.stockQuantity')}</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
              
              {/* Категория */}
              <div>
                <Label htmlFor="category">{t('form.category')} {t('form.required')}</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder={t('form.categoryPlaceholder')}
                />
              </div>
              
              {/* Изображения */}
              <div>
                <Label>{t('form.images')}</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder={t('form.imagePlaceholder')}
                      onKeyPress={(e) => e.key === 'Enter' && addImage()}
                    />
                    <Button type="button" onClick={addImage} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative h-20 bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={image}
                              alt={`${t('form.images')} ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="100px"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white hover:bg-red-600 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Статус активности */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => handleInputChange('inStock', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="inStock">{t('form.inStock')}</Label>
              </div>
              
              {/* Кнопки действий */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={saveProduct}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Spinner />
                      {t('form.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingProduct ? t('form.update') : t('form.create')}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeForm}
                  disabled={submitting}
                >
                  {t('form.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}