'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useContentData } from './hooks/useContentData';
import { useContentDialogs } from './hooks/useContentDialogs';
import { ContentStats } from './components/ContentStats';
import { ContentFilters } from './components/ContentFilters';
import { ContentTable } from './components/ContentTable';
import { ContentDialog } from './components/ContentDialog';
import { DeleteDialog } from './components/DeleteDialog';
import { ContentManagementProps } from './types';

export default function ContentManagement({ className }: ContentManagementProps) {
  const { data: session } = useSession();
  
  const {
    filteredPages,
    loading,
    stats,
    filters,
    selectedPages,
    updateFilters,
    togglePageSelection,
    selectAllPages,
    clearSelection,
    refreshPages
  } = useContentData();
  
  const {
    dialogStates,
    currentPage,
    activeTab,
    formData,
    setActiveTab,
    updateFormData,
    handleTitleChange,
    addTag,
    removeTag,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    createPage,
    updatePage,
    deletePage
  } = useContentDialogs();

  const handleCreatePage = async () => {
    await createPage(refreshPages);
  };

  const handleUpdatePage = async () => {
    await updatePage(refreshPages);
  };

  const handleDeletePage = async () => {
    await deletePage(refreshPages);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Необходима авторизация</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление контентом</h1>
          <p className="text-gray-500">
            Создавайте и управляйте страницами вашего сайта
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Создать страницу
        </Button>
      </div>

      <ContentStats stats={stats} loading={loading} />

      <Card>
        <CardHeader>
          <CardTitle>Страницы</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onRefresh={refreshPages}
            loading={loading}
          />
          
          {selectedPages.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-blue-700">
                Выбрано: {selectedPages.length} страниц(ы)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                >
                  Отменить выбор
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    // Здесь можно добавить массовое удаление
                    console.log('Массовое удаление:', selectedPages);
                  }}
                >
                  Удалить выбранные
                </Button>
              </div>
            </div>
          )}
          
          <ContentTable
            pages={filteredPages}
            selectedPages={selectedPages}
            onPageSelect={togglePageSelection}
            onSelectAll={selectAllPages}
            onClearSelection={clearSelection}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            loading={loading}
          />
        </CardContent>
      </Card>

      <ContentDialog
        open={dialogStates.isCreateDialogOpen}
        onClose={closeCreateDialog}
        onSave={handleCreatePage}
        formData={formData}
        onFormDataChange={updateFormData}
        onTitleChange={handleTitleChange}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title="Создать страницу"
        description="Создайте новую страницу для вашего сайта"
      />

      <ContentDialog
        open={dialogStates.isEditDialogOpen}
        onClose={closeEditDialog}
        onSave={handleUpdatePage}
        formData={formData}
        onFormDataChange={updateFormData}
        onTitleChange={handleTitleChange}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title="Редактировать страницу"
        description="Внесите изменения в существующую страницу"
      />

      <DeleteDialog
        open={dialogStates.isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeletePage}
      />
    </div>
  );
}