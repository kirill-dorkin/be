'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { IOrder } from '@/models/Order';
import useCustomToast from '@/hooks/useCustomToast';
import Spinner from '@/components/ui/spinner';
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrderWithUser extends IOrder {
  user: {
    name: string;
    email: string;
  };
}

export default function OrderManagement() {
  const { data: session, status } = useSession();
  const t = useTranslations('orderManagement');
  const { showSuccessToast, showErrorToast } = useCustomToast();
  
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  // Загрузка заказов
  const fetchOrders = useCallback(async () => {
    if (status === 'loading' || !session) {
      return;
    }
    
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(t('messages.loadErrorDescription'));
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showErrorToast({
        title: t('messages.loadError'),
        description: t('messages.loadErrorDescription')
      });
    } finally {
      setLoading(false);
    }
  }, [showErrorToast, t, session, status]);

  useEffect(() => {
    if (status !== 'loading') {
      fetchOrders();
    }
  }, [fetchOrders, status]);

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      String(order._id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Обновление статуса заказа
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!session) {
      showErrorToast({
        title: 'Ошибка',
        description: 'Необходима авторизация'
      });
      return;
    }
    
    setUpdating(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(t('messages.updateErrorDescription'));
      }

      await fetchOrders();
      showSuccessToast({
        title: t('messages.updateSuccess'),
        description: t('messages.updateSuccessDescription')
      });
    } catch (error) {
      console.error('Error updating order:', error);
      showErrorToast({
        title: t('messages.updateError'),
        description: t('messages.updateErrorDescription')
      });
    } finally {
      setUpdating(null);
    }
  };

  // Получение иконки статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('filters.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('filters.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.statusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                  <SelectItem value="pending">{t('status.pending')}</SelectItem>
                  <SelectItem value="processing">{t('status.processing')}</SelectItem>
                  <SelectItem value="shipped">{t('status.shipped')}</SelectItem>
                  <SelectItem value="delivered">{t('status.delivered')}</SelectItem>
                  <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список заказов */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('noOrders')}</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order._id?.toString() || order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">#{order._id?.toString().slice(-8) || 'N/A'}</h3>
                    <p className="text-sm text-gray-600">
                      {order.user?.name || t('unknownUser')} ({order.user?.email || t('noEmail')})
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">₽{order.totalAmount.toLocaleString()}</p>
                    <Badge className={`${getStatusColor(order.orderStatus)} flex items-center gap-1`}>
                      {getStatusIcon(order.orderStatus)}
                      {t(`status.${order.orderStatus}`)}
                    </Badge>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">{t('items')}:</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>₽{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Select
                      value={order.orderStatus}
                      onValueChange={(value) => updateOrderStatus(order._id?.toString() || '', value)}
                      disabled={updating === order._id?.toString()}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t('status.pending')}</SelectItem>
                        <SelectItem value="processing">{t('status.processing')}</SelectItem>
                        <SelectItem value="shipped">{t('status.shipped')}</SelectItem>
                        <SelectItem value="delivered">{t('status.delivered')}</SelectItem>
                        <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    {t('viewDetails')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}