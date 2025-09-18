import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmployeeData } from './hooks/useEmployeeData';
import { useEmployeeActions } from './hooks/useEmployeeActions';
import { useEmployeeDialogs } from './hooks/useEmployeeDialogs';
import { EmployeeStats } from './components/EmployeeStats';
import { EmployeeFilters } from './components/EmployeeFilters';
import { EmployeeTable } from './components/EmployeeTable';
import { EmployeeCreateDialog } from './components/EmployeeCreateDialog';
import { EmployeeEditDialog } from './components/EmployeeEditDialog';
import { EmployeeViewDialog } from './components/EmployeeViewDialog';
import { EmployeeDeleteDialog } from './components/EmployeeDeleteDialog';
import { EmployeeManagementProps } from './types';

export const EmployeeManagement: React.FC<EmployeeManagementProps> = () => {
  // Хуки для данных и действий
  const {
    employees,
    loading,
    stats,
    filters,
    pagination,
    updateFilters,
    goToPage,
    refreshEmployees
  } = useEmployeeData();

  const {
    createEmployee,
    updateEmployee,
    deleteEmployee
  } = useEmployeeActions(refreshEmployees);

  const {
    dialogStates,
    selectedEmployee,
    formData,
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    closeCreateDialog,
    closeEditDialog,
    closeViewDialog,
    closeDeleteDialog,
    updateFormData
  } = useEmployeeDialogs();

  // Обработчики действий
  const handleCreateEmployee = async () => {
    try {
      await createEmployee(formData);
      closeCreateDialog();
    } catch (error) {
      console.error('Ошибка создания сотрудника:', error);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      await updateEmployee(selectedEmployee._id as string, formData);
      closeEditDialog();
    } catch (error) {
      console.error('Ошибка обновления сотрудника:', error);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      await deleteEmployee(selectedEmployee._id as string);
      closeDeleteDialog();
    } catch (error) {
      console.error('Ошибка удаления сотрудника:', error);
    }
  };

  const handleEditEmployee = (employee: any) => {
    openEditDialog(employee);
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <EmployeeStats stats={stats} loading={loading} />
      
      {/* Основная карточка с фильтрами и таблицей */}
      <Card>
        <CardHeader>
          <CardTitle>Управление сотрудниками</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Фильтры */}
          <EmployeeFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onRefresh={refreshEmployees}
            onCreateClick={openCreateDialog}
          />
          
          {/* Таблица сотрудников */}
          <EmployeeTable
            employees={employees}
            loading={loading}
            pagination={pagination}
            onPageChange={goToPage}
            onView={openViewDialog}
            onEdit={handleEditEmployee}
            onDelete={openDeleteDialog}
          />
        </CardContent>
      </Card>

      {/* Диалоги */}
      <EmployeeCreateDialog
        open={dialogStates.isCreateDialogOpen}
        onOpenChange={(open) => !open && closeCreateDialog()}
        formData={formData}
        onFormDataChange={updateFormData}
        onSubmit={handleCreateEmployee}
        onCancel={closeCreateDialog}
      />

      <EmployeeEditDialog
        open={dialogStates.isEditDialogOpen}
        onOpenChange={(open) => !open && closeEditDialog()}
        employee={selectedEmployee}
        formData={formData}
        onFormDataChange={updateFormData}
        onSubmit={handleUpdateEmployee}
        onCancel={closeEditDialog}
      />

      <EmployeeViewDialog
        open={dialogStates.isViewDialogOpen}
        onOpenChange={(open) => !open && closeViewDialog()}
        employee={selectedEmployee}
      />

      <EmployeeDeleteDialog
        open={dialogStates.isDeleteDialogOpen}
        onOpenChange={(open) => !open && closeDeleteDialog()}
        employee={selectedEmployee}
        onConfirm={handleDeleteEmployee}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
};