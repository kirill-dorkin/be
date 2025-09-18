'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogTrigger } from '@/components/ui/dialog';
import { FolderOpen, Plus, Search, RefreshCw } from 'lucide-react';

import { CategoryStats } from './CategoryStats';
import { CategoryTable } from './CategoryTable';
import { CategoryDialog } from './CategoryDialog';
import { CategoryViewDialog } from './CategoryViewDialog';
import { CategoryDeleteDialog } from './CategoryDeleteDialog';
import { useCategoryData } from './hooks/useCategoryData';
import { useCategoryDialog } from './hooks/useCategoryDialog';
import { useCategoryActions } from './hooks/useCategoryActions';

const CategoryManagement = () => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    categories,
    loading,
    currentPage,
    totalPages,
    stats,
    fetchCategories,
    setCurrentPage
  } = useCategoryData();
  
  const {
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
  } = useCategoryDialog();
  
  const { createCategory, updateCategory, deleteCategory } = useCategoryActions();

  // Обработчики действий
  const handleCreateCategory = async () => {
    const success = await createCategory(formData);
    if (success) {
      updateDialogState({ isCreateDialogOpen: false });
      resetForm();
      fetchCategories(currentPage, searchTerm);
    }
  };

  const handleUpdateCategory = async () => {
    if (!dialogState.selectedCategory) return;
    
    const success = await updateCategory(dialogState.selectedCategory._id, formData);
    if (success) {
      updateDialogState({ isEditDialogOpen: false, selectedCategory: null });
      resetForm();
      fetchCategories(currentPage, searchTerm);
    }
  };

  const handleDeleteCategory = async () => {
    if (!dialogState.selectedCategory) return;
    
    const success = await deleteCategory(dialogState.selectedCategory._id);
    if (success) {
      updateDialogState({ isDeleteDialogOpen: false, selectedCategory: null });
      fetchCategories(currentPage, searchTerm);
    }
  };

  // Загрузка данных
  useEffect(() => {
    fetchCategories(1, searchTerm);
  }, [fetchCategories, searchTerm]);

  // Проверка прав доступа
  if (!session || session.user.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            У вас нет прав для просмотра этой страницы
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <CategoryStats stats={stats} />

      {/* Основная карточка */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Управление категориями
              </CardTitle>
              <CardDescription>
                Управление категориями для услуг и товаров
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCategories(currentPage, searchTerm)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить категорию
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Поиск */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск по названию категории..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Таблица */}
          <CategoryTable
            categories={categories}
            loading={loading}
            onView={openViewDialog}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Страница {currentPage} из {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    fetchCategories(newPage, searchTerm);
                  }}
                  disabled={currentPage === 1 || loading}
                >
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    fetchCategories(newPage, searchTerm);
                  }}
                  disabled={currentPage === totalPages || loading}
                >
                  Вперед
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалоги */}
      <CategoryDialog
        isOpen={dialogState.isCreateDialogOpen}
        onClose={() => {
          updateDialogState({ isCreateDialogOpen: false });
          resetForm();
        }}
        onSubmit={handleCreateCategory}
        formData={formData}
        setFormData={setFormData}
        title="Добавить новую категорию"
        description="Заполните информацию о новой категории"
        submitLabel="Создать"
      />

      <CategoryDialog
        isOpen={dialogState.isEditDialogOpen}
        onClose={() => {
          updateDialogState({ isEditDialogOpen: false, selectedCategory: null });
          resetForm();
        }}
        onSubmit={handleUpdateCategory}
        formData={formData}
        setFormData={setFormData}
        title="Редактировать категорию"
        description={`Обновите информацию о категории ${dialogState.selectedCategory?.name}`}
        submitLabel="Сохранить"
        category={dialogState.selectedCategory}
      />

      <CategoryViewDialog
        isOpen={dialogState.isViewDialogOpen}
        onClose={() => updateDialogState({ isViewDialogOpen: false, viewingCategory: null })}
        category={dialogState.viewingCategory}
      />

      <CategoryDeleteDialog
        isOpen={dialogState.isDeleteDialogOpen}
        onClose={() => updateDialogState({ isDeleteDialogOpen: false, selectedCategory: null })}
        onConfirm={handleDeleteCategory}
        category={dialogState.selectedCategory}
      />
    </div>
  );
};

export default CategoryManagement;