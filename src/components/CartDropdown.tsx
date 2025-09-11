'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import useCustomToast from '@/hooks/useCustomToast';

interface CartDropdownProps {
  className?: string;
}

export default function CartDropdown({ className = '' }: CartDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { cartItems, cartCount, loading, updateQuantity, removeFromCart } = useCart();

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Обработчик обновления количества с обработкой ошибок
  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(productId);
    try {
      await updateQuantity(productId, newQuantity);
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

  // Обработчик удаления товара с обработкой ошибок
  const handleRemoveItem = async (productId: string) => {
    setUpdating(productId);
    try {
      await removeFromCart(productId);
      showSuccessToast({
        title: 'Товар удален',
        description: 'Товар успешно удален из корзины'
      });
    } catch (error) {
      console.error('Error removing item:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось удалить товар из корзины'
      });
    } finally {
      setUpdating(null);
    }
  };

  // Подсчет общей стоимости
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );



  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Кнопка корзины */}
      <Button 
        variant="outline" 
        size="sm" 
        className="relative p-2 hover:bg-primary hover:text-primary-foreground transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ShoppingCart className="h-5 w-5" />
        {!loading && cartCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
          >
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        )}
      </Button>

      {/* Выпадающее меню корзины */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 z-50">
          <Card className="shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Корзина ({cartCount})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 mb-4">Корзина пуста</p>
                  <Link href="/products">
                    <Button size="sm" onClick={() => setIsOpen(false)}>
                      Перейти к покупкам
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Список товаров */}
                  <div className="max-h-80 overflow-y-auto px-4">
                    {cartItems.slice(0, 3).map((item) => (
                      <div key={String(item.productId)} className="flex gap-3 py-3 border-b last:border-b-0">
                        {/* Изображение */}
                        <div className="relative w-12 h-12 flex-shrink-0">
                          {item.product.images && item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs">Нет фото</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Информация о товаре */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                          <p className="text-xs text-gray-500 mb-1">{formatPrice(item.product.price)} за шт.</p>
                          
                          {/* Управление количеством */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleUpdateQuantity(String(item.productId), item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating === String(item.productId)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleUpdateQuantity(String(item.productId), item.quantity + 1)}
                              disabled={item.quantity >= item.product.stockQuantity || updating === String(item.productId)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={() => handleRemoveItem(String(item.productId))}
                              disabled={updating === String(item.productId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Цена */}
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {cartItems.length > 3 && (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-500">И еще {cartItems.length - 3} товар(ов)</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Итоги и кнопки */}
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">Итого:</span>
                      <span className="font-bold text-lg">{formatPrice(totalAmount)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Link href="/cart" className="block">
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => setIsOpen(false)}
                        >
                          Перейти в корзину
                        </Button>
                      </Link>
                      <Link href="/checkout" className="block">
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="sm"
                          onClick={() => setIsOpen(false)}
                        >
                          Оформить заказ
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}