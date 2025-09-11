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
        throw new Error('Ошибка при загрузке товаров');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось загрузить товары'
      });
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

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
        title: 'Ошибка валидации',
        description: 'Заполните все обязательные поля'
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
        throw new Error(editingProduct ? 'Ошибка при обновлении товара' : 'Ошибка при создании товара');
      }
      
      const savedProduct = await response.json();
      
      if (editingProduct) {
        setProducts(prev => 
          prev.map(p => p._id === editingProduct._id ? savedProduct : p)
        );
        showSuccessToast({
          title: 'Успех',
          description: 'Товар обновлен'
        });
      } else {
        setProducts(prev => [savedProduct, ...prev]);
        showSuccessToast({
          title: 'Успех',
          description: 'Товар создан'
        });
      }
      
      closeForm();
    } catch (error) {
      console.error('Error saving product:', error);
      showErrorToast({
        title: 'Ошибка',
        description: editingProduct ? 'Не удалось обновить товар' : 'Не удалось создать товар'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Удаление товара
  const deleteProduct = async (product: IProduct) => {
    if (!confirm(`Вы уверены, что хотите удалить товар "${product.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при удалении товара');
      }
      
      setProducts(prev => prev.filter(p => p._id !== product._id));
      
      showSuccessToast({
        title: 'Успех',
        description: 'Товар удален'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось удалить товар'
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
        throw new Error('Ошибка при изменении статуса товара');
      }
      
      const updatedProduct = await response.json();
      
      setProducts(prev => 
        prev.map(p => p._id === product._id ? updatedProduct : p)
      );
      
      showSuccessToast({
        title: 'Успех',
        description: `Товар ${updatedProduct.inStock ? 'активирован' : 'деактивирован'}`
      });
    } catch (error) {
      console.error('Error toggling product status:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус товара'
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
            Управление товарами
          </h1>
          <p className="text-gray-600 mt-1">Добавление, редактирование и удаление товаров</p>
        </div>
        
        <Button onClick={openCreateForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Добавить товар
        </Button>
      </div>

      {/* Поиск */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск товаров по названию или категории..."
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
                  <span className="text-gray-500">Категория:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">В наличии:</span>
                  <span className="font-medium">{product.stockQuantity} шт.</span>
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
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
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
                  {searchTerm ? 'Товары не найдены' : 'Нет товаров'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первый товар'}
                </p>
              </div>
              {!searchTerm && (
                <Button onClick={openCreateForm}>
                  Добавить товар
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
                  {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={closeForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Название */}
              <div>
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Введите название товара"
                />
              </div>
              
              {/* Описание */}
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Введите описание товара"
                  rows={3}
                />
              </div>
              
              {/* Цена и количество */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Цена *</Label>
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
                  <Label htmlFor="stockQuantity">Количество</Label>
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
                <Label htmlFor="category">Категория *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Введите категорию товара"
                />
              </div>
              
              {/* Изображения */}
              <div>
                <Label>Изображения</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="URL изображения"
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
                              alt={`Изображение ${index + 1}`}
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
                <Label htmlFor="inStock">Товар в наличии</Label>
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
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingProduct ? 'Обновить' : 'Создать'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeForm}
                  disabled={submitting}
                >
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}