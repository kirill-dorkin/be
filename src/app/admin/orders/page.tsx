'use client';

import BaseContainer from '@/components/BaseContainer';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: {
    productId: {
      _id: string;
      name: string;
      price: number;
      images?: string[];
    };
    quantity: number;
    price: number;
    total: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  shippingAddress?: any;
  paymentMethod?: string;
  trackingNumber?: string;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Проверка авторизации
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/orders?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setStats(data.stats);
        setPagination(data.pagination);
        setError(null);
      } else {
        setError(data.error || 'Ошибка загрузки заказов');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        fetchOrders(); // Перезагрузить список
      } else {
        alert(data.error || 'Ошибка обновления статуса');
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление заказами</h1>
        <p className="text-gray-600">Просмотр и управление всеми заказами в системе</p>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Всего заказов</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Общая выручка</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalRevenue.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Средний чек</h3>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(stats.averageOrderValue).toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Ожидают обработки</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Фильтры</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Все статусы</option>
            <option value="pending">Ожидает</option>
            <option value="processing">Обработка</option>
            <option value="shipped">Отправлен</option>
            <option value="delivered">Доставлен</option>
            <option value="cancelled">Отменен</option>
          </select>
          
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-md px-3 py-2"
            placeholder="Дата от"
          />
          
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-md px-3 py-2"
            placeholder="Дата до"
          />
          
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-md px-3 py-2"
            placeholder="Сумма от"
          />
          
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-md px-3 py-2"
            placeholder="Сумма до"
          />
          
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters({ ...filters, sortBy, sortOrder, page: 1 });
            }}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="createdAt-desc">Новые первые</option>
            <option value="createdAt-asc">Старые первые</option>
            <option value="totalAmount-desc">Сумма: больше</option>
            <option value="totalAmount-asc">Сумма: меньше</option>
          </select>
        </div>
      </div>

      {/* Список заказов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Загрузка...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Заказы не найдены</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Заказ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Клиент
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Товары
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сумма
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order._id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.userId.name}</div>
                        <div className="text-sm text-gray-500">{order.userId.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items.length} товар(ов)
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.slice(0, 2).map(item => item.productId.name).join(', ')}
                          {order.items.length > 2 && '...'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.totalAmount.toLocaleString('ru-RU')} ₽
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">Ожидает</option>
                          <option value="processing">Обработка</option>
                          <option value="shipped">Отправлен</option>
                          <option value="delivered">Доставлен</option>
                          <option value="cancelled">Отменен</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Подробнее
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Предыдущая
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, filters.page + 1) })}
                    disabled={filters.page === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Следующая
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Показано <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> до{' '}
                      <span className="font-medium">
                        {Math.min(filters.page * filters.limit, pagination.totalItems)}
                      </span>{' '}
                      из <span className="font-medium">{pagination.totalItems}</span> результатов
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setFilters({ ...filters, page })}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === filters.page
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}