'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  MapPin, 
  CreditCard, 
  User,
  Phone
} from 'lucide-react';
import { IOrder } from '@/models/Order';
import { IProduct } from '@/models/Product';
import useCustomToast from '@/hooks/useCustomToast';
import { useRouter } from 'next/navigation';

interface OrderItemWithProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  product: IProduct | null;
}

interface OrderWithProducts extends Omit<IOrder, 'items'> {
  items: OrderItemWithProduct[];
}

interface OrderDetailsProps {
  order: OrderWithProducts;
}

const statusConfig = {
  pending: {
    label: 'Ожидает обработки',
    color: 'text-yellow-600 bg-yellow-50',
    icon: Clock
  },
  confirmed: {
    label: 'Подтвержден',
    color: 'text-blue-600 bg-blue-50',
    icon: CheckCircle
  },
  processing: {
    label: 'В обработке',
    color: 'text-blue-600 bg-blue-50',
    icon: Package
  },
  shipped: {
    label: 'Отправлен',
    color: 'text-purple-600 bg-purple-50',
    icon: Truck
  },
  delivered: {
    label: 'Доставлен',
    color: 'text-green-600 bg-green-50',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Отменен',
    color: 'text-red-600 bg-red-50',
    icon: XCircle
  }
};

// Удаляем deliveryMethodLabels, так как в модели Order нет deliveryMethod

const paymentMethodLabels = {
  card: 'Банковская карта',
  cash: 'Наличными при получении',
  online: 'Онлайн оплата'
};

export default function OrderDetails({ order }: OrderDetailsProps) {
  const router = useRouter();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [cancelling, setCancelling] = useState(false);

  // Отмена заказа
  const handleCancelOrder = async () => {
    if (!confirm('Вы уверены, что хотите отменить заказ?')) {
      return;
    }
    
    setCancelling(true);
    try {
      const response = await fetch(`/api/orders/${order._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при отмене заказа');
      }
      
      showSuccessToast({
        title: 'Заказ отменен',
        description: 'Ваш заказ был успешно отменен'
      });
      
      // Обновляем страницу
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling order:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось отменить заказ'
      });
    } finally {
      setCancelling(false);
    }
  };

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  // Форматирование даты
  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const status = statusConfig[order.orderStatus as keyof typeof statusConfig];
  const StatusIcon = status?.icon || Clock;
  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Заказ #{String(order._id)}</h1>
          <p className="text-gray-600 mt-1">
            Создан {formatDate(order.createdAt)}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Статус заказа */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${status?.color || 'text-gray-600 bg-gray-50'}`}>
            <StatusIcon className="h-4 w-4" />
            <span className="font-medium">{status?.label || order.orderStatus}</span>
          </div>
          
          {/* Кнопка отмены */}
          {canCancel && (
            <Button
              variant="outline"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? 'Отменяем...' : 'Отменить заказ'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Товары в заказе */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Товары в заказе
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  {/* Изображение товара */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {item.product?.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name || 'Товар'}
                        fill
                        className="object-cover rounded"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Нет фото</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Информация о товаре */}
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {item.product?.name || 'Товар не найден'}
                    </h3>
                    {item.product?.category && (
                      <p className="text-sm text-gray-500">{item.product.category}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">
                        {item.quantity} × {formatPrice(item.price)}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Информация о доставке */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Адрес доставки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Контактная информация */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Контактная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{order.shippingAddress.phone}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Комментарий к заказу */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Комментарий к заказу</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Боковая панель */}
        <div className="lg:col-span-1 space-y-6">
          {/* Итоги заказа */}
          <Card>
            <CardHeader>
              <CardTitle>Итоги заказа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Товары:</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Доставка:</span>
                  <span className="text-green-600">Бесплатно</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Итого:</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Способ доставки и оплаты */}
          <Card>
            <CardHeader>
              <CardTitle>Детали заказа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Доставка</p>
                  <p className="text-sm text-gray-600">
                    Стандартная доставка
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Оплата</p>
                  <p className="text-sm text-gray-600">
                    {paymentMethodLabels[order.paymentMethod as keyof typeof paymentMethodLabels] || order.paymentMethod}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Действия */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button
                onClick={() => router.push('/products')}
                className="w-full"
                variant="outline"
              >
                Продолжить покупки
              </Button>
              
              <Button
                onClick={() => router.push('/orders')}
                className="w-full"
                variant="outline"
              >
                Мои заказы
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}