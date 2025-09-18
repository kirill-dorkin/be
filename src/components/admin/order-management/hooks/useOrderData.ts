import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import { Order, OrderStats, UseOrderDataReturn } from '../types';

export const useOrderData = (): UseOrderDataReturn => {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заказы',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session, fetchOrders]);

  return {
    orders,
    stats,
    loading,
    fetchOrders
  };
};