import { useCallback } from 'react';
import { toast } from 'sonner';
import { EmployeeFormData } from '../types';

export const useEmployeeActions = (refreshEmployees: () => Promise<void>) => {
  const createEmployee = useCallback(async (formData: EmployeeFormData) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Сотрудник успешно создан');
        await refreshEmployees();
      } else {
        toast.error(data.error || 'Ошибка при создании сотрудника');
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Ошибка при создании сотрудника:', error);
      if (error instanceof Error && !error.message.includes('Ошибка при создании')) {
        toast.error('Ошибка при создании сотрудника');
      }
      throw error;
    }
  }, [refreshEmployees]);

  const updateEmployee = useCallback(async (employeeId: string, formData: EmployeeFormData) => {
    try {
      const response = await fetch(`/api/admin/users/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Сотрудник успешно обновлен');
        await refreshEmployees();
      } else {
        toast.error(data.error || 'Ошибка при обновлении сотрудника');
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Ошибка при обновлении сотрудника:', error);
      if (error instanceof Error && !error.message.includes('Ошибка при обновлении')) {
        toast.error('Ошибка при обновлении сотрудника');
      }
      throw error;
    }
  }, [refreshEmployees]);

  const deleteEmployee = useCallback(async (employeeId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${employeeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Сотрудник успешно удален');
        await refreshEmployees();
      } else {
        toast.error(data.error || 'Ошибка при удалении сотрудника');
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Ошибка при удалении сотрудника:', error);
      if (error instanceof Error && !error.message.includes('Ошибка при удалении')) {
        toast.error('Ошибка при удалении сотрудника');
      }
      throw error;
    }
  }, [refreshEmployees]);

  return {
    createEmployee,
    updateEmployee,
    deleteEmployee
  };
};