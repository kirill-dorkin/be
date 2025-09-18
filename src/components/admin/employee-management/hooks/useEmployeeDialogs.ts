import { useState, useCallback } from 'react';
import { Employee, EmployeeFormData, EmployeeDialogStates } from '../types';

export const useEmployeeDialogs = () => {
  const [dialogStates, setDialogStates] = useState<EmployeeDialogStates>({
    isCreateDialogOpen: false,
    isEditDialogOpen: false,
    isViewDialogOpen: false,
    isDeleteDialogOpen: false
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    role: 'user',
    isActive: true,
    phone: '',
    position: ''
  });

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      isActive: true,
      phone: '',
      position: ''
    });
  }, []);

  const openCreateDialog = useCallback(() => {
    resetForm();
    setDialogStates(prev => ({ ...prev, isCreateDialogOpen: true }));
  }, [resetForm]);

  const closeCreateDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, isCreateDialogOpen: false }));
    resetForm();
  }, [resetForm]);

  const openEditDialog = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      role: employee.role as 'admin' | 'worker' | 'user',
      isActive: true, // Предполагаем активный статус
      phone: '',
      position: ''
    });
    setDialogStates(prev => ({ ...prev, isEditDialogOpen: true }));
  }, []);

  const closeEditDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, isEditDialogOpen: false }));
    setSelectedEmployee(null);
    resetForm();
  }, [resetForm]);

  const openViewDialog = useCallback((employee: Employee) => {
    setViewingEmployee(employee);
    setDialogStates(prev => ({ ...prev, isViewDialogOpen: true }));
  }, []);

  const closeViewDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, isViewDialogOpen: false }));
    setViewingEmployee(null);
  }, []);

  const openDeleteDialog = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogStates(prev => ({ ...prev, isDeleteDialogOpen: true }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, isDeleteDialogOpen: false }));
    setSelectedEmployee(null);
  }, []);

  const updateFormData = useCallback((updates: Partial<EmployeeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    dialogStates,
    selectedEmployee,
    viewingEmployee,
    formData,
    updateFormData,
    resetForm,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openViewDialog,
    closeViewDialog,
    openDeleteDialog,
    closeDeleteDialog
  };
};