import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { User, UserFormData, BulkActionData } from '../types';

interface UseUserActionsProps {
  refreshUsers: () => Promise<void>;
}

interface UseUserActionsReturn {
  createUser: (formData: UserFormData) => Promise<boolean>;
  updateUser: (userId: string, formData: UserFormData) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  bulkAction: (action: string, userIds: string[], data?: BulkActionData) => Promise<boolean>;
  exportUsers: () => Promise<void>;
}

export const useUserActions = ({ refreshUsers }: UseUserActionsProps): UseUserActionsReturn => {
  const createUser = useCallback(async (formData: UserFormData): Promise<boolean> => {
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
        toast({
          title: 'Успех',
          description: 'Пользователь успешно создан',
        });
        await refreshUsers();
        return true;
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать пользователя',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети при создании пользователя',
        variant: 'destructive'
      });
      return false;
    }
  }, [refreshUsers]);

  const updateUser = useCallback(async (userId: string, formData: UserFormData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успех',
          description: 'Пользователь успешно обновлен',
        });
        await refreshUsers();
        return true;
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить пользователя',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети при обновлении пользователя',
        variant: 'destructive'
      });
      return false;
    }
  }, [refreshUsers]);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успех',
          description: 'Пользователь успешно удален',
        });
        await refreshUsers();
        return true;
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось удалить пользователя',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети при удалении пользователя',
        variant: 'destructive'
      });
      return false;
    }
  }, [refreshUsers]);

  const bulkAction = useCallback(async (
    action: string, 
    userIds: string[], 
    data?: BulkActionData
  ): Promise<boolean> => {
    if (userIds.length === 0) return false;

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userIds,
          data
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Успех',
          description: result.message,
        });
        await refreshUsers();
        return true;
      } else {
        toast({
          title: 'Ошибка',
          description: result.error || 'Не удалось выполнить операцию',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети при выполнении операции',
        variant: 'destructive'
      });
      return false;
    }
  }, [refreshUsers]);

  const exportUsers = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/users/export', {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Успех',
          description: 'Данные пользователей экспортированы',
        });
      } else {
        throw new Error('Ошибка экспорта');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось экспортировать данные',
        variant: 'destructive'
      });
    }
  }, []);

  return {
    createUser,
    updateUser,
    deleteUser,
    bulkAction,
    exportUsers
  };
};