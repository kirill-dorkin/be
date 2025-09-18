import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductStats } from './ProductStats';
import { ProductFilters } from './ProductFilters';
import { ProductForm } from './ProductForm';
import { useProductManagement, useProductForm } from './hooks';
import { ProductUtils } from './utils';
import { ProductWithStats, ProductFormData } from './types';

export const ProductManagement: React.FC = () => {
  const {
    products,
    categories,
    stats,
    filters,
    pagination,
    selectedProducts,
    loading,
    setFilters,
    setSelectedProducts,
    refreshProducts,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleBulkAction
  } = useProductManagement();

  const {
    formData,
    isDialogOpen,
    editingProduct,
    setFormData,
    setIsDialogOpen,
    setEditingProduct,
    resetForm,
    openEditDialog,
    addImage,
    removeImage,
    addSpecification,
    removeSpecification,
    addTag,
    removeTag
  } = useProductForm();

  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleFormSubmit = async () => {
    try {
      if (editingProduct) {
        await handleUpdateProduct(editingProduct._id as string, formData);
      } else {
        await handleCreateProduct(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleFormCancel = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleProductSelect = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p._id as string));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      await handleBulkAction('delete', selectedProducts);
      setSelectedProducts([]);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const filteredProducts = ProductUtils.filterProducts(products, filters);
  const paginatedProducts = ProductUtils.paginateProducts(filteredProducts, pagination);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Управление продуктами</h1>
          <p className="text-muted-foreground">
            Управляйте каталогом продуктов вашего магазина
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить продукт
        </Button>
      </div>

      {/* Статистика */}
      <ProductStats stats={stats} loading={loading} />

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры и поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductFilters
            filters={filters}
            categories={categories}
            onFiltersChange={setFilters}
            onRefresh={refreshProducts}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Массовые действия */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Выбрано: {selectedProducts.length} из {filteredProducts.length}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {bulkActionLoading ? 'Удаление...' : 'Удалить выбранные'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Таблица продуктов */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Продукты ({filteredProducts.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Выбрать все</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Продукты не найдены</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedProducts.map((product) => (
                <div key={product._id as string} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={selectedProducts.includes(product._id as string)}
                    onCheckedChange={(checked) => handleProductSelect(product._id as string, checked as boolean)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <Badge variant={ProductUtils.getStockStatus(product.stock) === 'В наличии' ? 'default' : 'destructive'}>
                        {ProductUtils.getStockStatus(product.stock)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {product.description || 'Нет описания'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Цена: {ProductUtils.formatPrice(product.price)}</span>
                      <span>Запас: {product.stock}</span>
                      {product.sku && <span>SKU: {product.sku}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product._id as string)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог формы */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Редактировать продукт' : 'Добавить продукт'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            formData={formData}
            categories={categories}
            onFormDataChange={setFormData}
            onAddImage={addImage}
            onRemoveImage={removeImage}
            onAddSpecification={addSpecification}
            onRemoveSpecification={removeSpecification}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={loading}
            isEdit={!!editingProduct}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;