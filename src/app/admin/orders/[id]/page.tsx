'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
      description?: string;
    };
    quantity: number;
    price: number;
    total: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod?: string;
  trackingNumber?: string;
  notes?: string;
  statusHistory?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Проверка авторизации
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        setTrackingNumber(data.order.trackingNumber || '');
        setNotes(data.order.notes || '');
        setError(null);
      } else {
        setError(data.error || 'Ошибка загрузки заказа');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const updateOrder = async (updates: Partial<Order>) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        setOrder(data.order);
        alert('Заказ успешно обновлен');
      } else {
        alert(data.error || 'Ошибка обновления заказа');
      }
    } catch (err) {
      alert('Ошибка сети');
    } finally {
      setUpdating(false);
    }
  };

  const deleteOrder = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        alert('Заказ успешно удален');
        router.push('/admin/orders');
      } else {
        alert(data.error || 'Ошибка удаления заказа');
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

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Ожидает',
      processing: 'Обработка',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен'
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Загрузка заказа...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error || 'Заказ не найден'}</div>
          <Link href="/admin/orders" className="text-red-600 hover:text-red-800 mt-2 inline-block">
            ← Вернуться к списку заказов
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/orders" className="text-indigo-600 hover:text-indigo-800 mb-2 inline-block">
              ← Вернуться к заказам
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Заказ #{order._id.slice(-8)}
            </h1>
            <p className="text-gray-600 mt-1">
              Создан {new Date(order.createdAt).toLocaleString('ru-RU')}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            {(order.status === 'pending' || order.status === 'cancelled') && (
              <button
                onClick={deleteOrder}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Удалить заказ
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Товары */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Товары в заказе</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  {item.productId.images && item.productId.images[0] && (
                    <img
                      src={item.productId.images[0]}
                      alt={item.productId.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.productId.name}</h3>
                    <p className="text-sm text-gray-500">Цена: {item.price.toLocaleString('ru-RU')} ₽</p>
                    <p className="text-sm text-gray-500">Количество: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {item.total.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Итого:</span>
                <span className="text-xl font-bold text-gray-900">
                  {order.totalAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          </div>

          {/* Управление статусом */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Управление заказом</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус заказа
                </label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrder({ status: e.target.value as any })}
                  disabled={updating}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="pending">Ожидает</option>
                  <option value="processing">Обработка</option>
                  <option value="shipped">Отправлен</option>
                  <option value="delivered">Доставлен</option>
                  <option value="cancelled">Отменен</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Трек-номер
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Введите трек-номер"
                  />
                  <button
                    onClick={() => updateOrder({ trackingNumber })}
                    disabled={updating}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Сохранить
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заметки
                </label>
                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Добавить заметку к заказу"
                  />
                  <button
                    onClick={() => updateOrder({ notes })}
                    disabled={updating}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Сохранить заметку
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* История статусов */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">История изменений</h2>
              <div className="space-y-3">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(history.status)}`}>
                      {getStatusText(history.status)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(history.timestamp).toLocaleString('ru-RU')}
                    </span>
                    {history.note && (
                      <span className="text-sm text-gray-500">- {history.note}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Информация о клиенте */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Клиент</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Имя</p>
                <p className="font-medium">{order.userId.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.userId.email}</p>
              </div>
              {order.userId.phone && (
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <p className="font-medium">{order.userId.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Адрес доставки */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Адрес доставки</h2>
              <div className="space-y-1 text-sm">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Информация об оплате */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Оплата</h2>
            <div className="space-y-3">
              {order.paymentMethod && (
                <div>
                  <p className="text-sm text-gray-500">Способ оплаты</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Сумма заказа</p>
                <p className="text-lg font-bold text-green-600">
                  {order.totalAmount.toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>
          </div>

          {/* Трекинг */}
          {order.trackingNumber && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Отслеживание</h2>
              <div>
                <p className="text-sm text-gray-500">Трек-номер</p>
                <p className="font-medium font-mono">{order.trackingNumber}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}