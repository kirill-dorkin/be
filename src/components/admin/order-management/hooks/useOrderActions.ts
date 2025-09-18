import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import { Order, UseOrderActionsProps, UseOrderActionsReturn } from '../types';

export const useOrderActions = ({ onOrderUpdate }: UseOrderActionsProps): UseOrderActionsReturn => {
  const { data: session } = useSession();
  const [isExporting, setIsExporting] = useState(false);

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      
      await onOrderUpdate();
      toast({
        title: 'Успешно',
        description: 'Заказ обновлен',
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить заказ',
        variant: 'destructive',
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
      
      await onOrderUpdate();
      toast({
        title: 'Успешно',
        description: 'Заказ удален',
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить заказ',
        variant: 'destructive',
      });
    }
  };

  const bulkAction = async (action: 'delete' | 'updateStatus', orderIds: string[], value?: string) => {
    if (orderIds.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/orders/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          action,
          orderIds,
          value,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }
      
      await onOrderUpdate();
      toast({
        title: 'Успешно',
        description: `Операция выполнена для ${orderIds.length} заказов`,
      });
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить операцию',
        variant: 'destructive',
      });
    }
  };

  const exportOrders = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/admin/orders/export', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to export orders');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Успешно',
        description: 'Данные экспортированы',
      });
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось экспортировать данные',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    updateOrder,
    deleteOrder,
    bulkAction,
    exportOrders,
    isExporting
  };
};