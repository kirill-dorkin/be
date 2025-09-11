'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

import useCustomToast from '@/hooks/useCustomToast';
import Spinner from '@/components/ui/spinner';
import { useCart } from '@/hooks/useCart';



interface ShoppingCartProps {
  onCheckout?: () => void;
  className?: string;
}

export default function ShoppingCart({
  onCheckout,
  className = ''
}: ShoppingCartProps) {
  const router = useRouter();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { cartItems, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  
  const [updating, setUpdating] = useState<string | null>(null);

  // useCart hook handles cart loading automatically

  // Обновление количества товара
  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(productId);
      return;
    }

    setUpdating(productId);
    try {
      await updateQuantity(productId, newQuantity);
      showSuccessToast({
        title: 'Успех',
        description: 'Количество товара обновлено'
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось обновить количество товара'
      });
    } finally {
      setUpdating(null);
    }
  };

  // Удаление товара из корзины
  const handleRemoveItem = async (productId: string) => {
    setUpdating(productId);
    try {
      await removeFromCart(productId);
      showSuccessToast({
        title: 'Успех',
        description: 'Товар удален из корзины'
      });
    } catch (error) {
      console.error('Error removing item:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось удалить товар'
      });
    } finally {
      setUpdating(null);
    }
  };

  // Очистка корзины
  const handleClearCart = async () => {
    try {
      await clearCart();
      showSuccessToast({
        title: 'Успех',
        description: 'Корзина очищена'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось очистить корзину'
      });
    }
  };

  // Переход к оформлению заказа
  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      router.push('/checkout');
    }
  };

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  // Подсчет общей стоимости
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );



  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2 !mt-0">
          <ShoppingBag className="h-6 w-6" />
          Корзина ({totalItems})
        </h2>
        
        {cartItems.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearCart}
            disabled={loading}
          >
            Очистить корзину
          </Button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <ShoppingBag className="h-16 w-16 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Корзина пуста</h3>
                  <p className="text-gray-500">Добавьте товары в корзину для оформления заказа</p>
                </div>
                <Button onClick={() => router.push('/products')}>
                  Перейти к покупкам
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Список товаров */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={String(item.productId)}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Изображение товара */}
                    <div className="relative w-full h-48 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 96px, 128px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Нет фото</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Информация о товаре */}
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <div className="flex-1 pr-2">
                          <div className="font-medium text-lg md:text-xl line-clamp-1" role="heading" aria-level={3}>{item.product.name}</div>
                          {item.product.category && (
                            <p className="text-sm text-gray-500 mt-1">{item.product.category}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(String(item.productId))}
                          disabled={updating === String(item.productId)}
                          className="p-1 h-6 w-6 md:h-5 md:w-5 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Управление количеством */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(String(item.productId), item.quantity - 1)}
                            disabled={item.quantity <= 1 || updating === String(item.productId)}
                            className="h-10 w-10 p-0 md:h-8 md:w-8"
                          >
                            <Minus className="h-4 w-4 md:h-3 md:w-3" />
                          </Button>
                          
                          <Input
                            type="number"
                            min="1"
                            max={item.product.stockQuantity}
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              if (newQuantity !== item.quantity) {
                                handleUpdateQuantity(String(item.productId), newQuantity);
                              }
                            }}
                            className="w-16 h-10 text-center md:h-8"
                            disabled={updating === String(item.productId)}
                          />
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(String(item.productId), item.quantity + 1)}
                            disabled={item.quantity >= item.product.stockQuantity || updating === String(item.productId)}
                            className="h-10 w-10 p-0 md:h-8 md:w-8"
                          >
                            <Plus className="h-4 w-4 md:h-3 md:w-3" />
                          </Button>
                        </div>
                        
                        {/* Цена */}
                        <div className="text-right">
                          <p className="font-medium text-lg md:text-base">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.product.price)} за шт.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Итоги заказа */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <Card className="lg:sticky lg:top-4">
              <CardHeader>
                <CardTitle className="text-xl">Итоги заказа</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span>Товары ({totalItems} шт.):</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span>Доставка:</span>
                    <span className="text-green-600">Бесплатно</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Итого:</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 text-lg"
                  size="lg"
                  disabled={cartItems.length === 0}
                >
                  Оформить заказ
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/products')}
                  className="w-full h-12 text-base"
                >
                  Продолжить покупки
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}