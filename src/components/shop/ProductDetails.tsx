'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Heart, Minus, Plus, ArrowLeft } from 'lucide-react';
import { IProduct } from '@/models/Product';
import useCustomToast from '@/hooks/useCustomToast';
import { useRouter } from 'next/navigation';

interface ProductDetailsProps {
  product: IProduct;
  onAddToCart?: (productId: string, quantity: number) => void;
  className?: string;
}

export default function ProductDetails({
  product,
  onAddToCart,
  className = ''
}: ProductDetailsProps) {
  const router = useRouter();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = async () => {
    if (!onAddToCart) return;
    
    setIsLoading(true);
    try {
      await onAddToCart(String(product._id), quantity);
      
      // Отправляем событие обновления корзины
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      showSuccessToast({
        title: 'Успех',
        description: `${quantity} шт. добавлено в корзину`
      });
    } catch {
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось добавить товар в корзину'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    showSuccessToast({
      title: 'Избранное',
      description: isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное'
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Кнопка назад */}
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к каталогу
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Изображения товара */}
        <div className="space-y-4">
          {/* Основное изображение */}
          <div className="relative aspect-square overflow-hidden rounded-lg border">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[selectedImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <span className="text-gray-400 text-lg">Нет изображения</span>
              </div>
            )}
          </div>
          
          {/* Миниатюры */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square overflow-hidden rounded border-2 transition-colors ${
                    index === selectedImageIndex
                      ? 'border-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className="space-y-6">
          {/* Заголовок и категория */}
          <div className="space-y-2">
            {product.category && (
              <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                {product.category}
              </span>
            )}
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          {/* Цена и статус */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              
              {/* Статусы */}
              <div className="flex gap-2">
                {isOutOfStock && (
                  <span className="inline-flex items-center rounded-full border border-transparent bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Нет в наличии
                  </span>
                )}
                {isLowStock && (
                  <span className="inline-flex items-center rounded-full border border-transparent bg-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Мало товара
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              {isOutOfStock ? 'Нет в наличии' : `В наличии: ${product.stockQuantity} шт.`}
            </p>
          </div>

          {/* Описание */}
          {product.description && (
            <Card>
              <CardHeader>
                <CardTitle>Описание</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Количество и добавление в корзину */}
          {!isOutOfStock && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Количество:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    min="1"
                    max={product.stockQuantity}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-20 text-center"
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm text-gray-600 ml-2">
                    из {product.stockQuantity} доступно
                  </span>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="flex-1"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Добавление...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Добавить в корзину
                    </div>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleFavorite}
                  className="px-4"
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                  />
                </Button>
              </div>
              
              {/* Общая стоимость */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Общая стоимость:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Сообщение о недоступности */}
          {isOutOfStock && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-gray-600">Товар временно недоступен</p>
                  <Button variant="outline" size="sm">
                    Уведомить о поступлении
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}