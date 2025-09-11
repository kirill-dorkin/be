'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ShoppingCart, Heart, Eye, ShoppingBag, CreditCard } from 'lucide-react';
import { IProduct } from '@/models/Product';
import useCustomToast from '@/hooks/useCustomToast';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: IProduct;
  onViewDetails?: (productId: string) => void;
  onBuyNow?: (productId: string) => void;
  showBuyNow?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  onViewDetails,
  onBuyNow,
  showBuyNow = false,
  className = ''
}: ProductCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addToCart(String(product._id), 1);
      showSuccessToast({ title: 'Успех', description: 'Товар добавлен в корзину' });
    } catch {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка при добавлении в корзину' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(String(product._id));
    }
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(String(product._id));
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    showSuccessToast({
      title: 'Избранное',
      description: isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное'
    });
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
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      {/* Изображение товара */}
      <div className="relative aspect-square overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={product.featured || false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-gray-400">Нет изображения</span>
          </div>
        )}
        
        {/* Бейджи */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isOutOfStock && (
            <span className="inline-flex items-center rounded-full border border-transparent bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              Нет в наличии
            </span>
          )}
          {isLowStock && (
            <span className="inline-flex items-center rounded-full border border-transparent bg-gray-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              Мало товара
            </span>
          )}
        </div>
        
        {/* Кнопки действий */}
        <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0"
            onClick={toggleFavorite}
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0"
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Контент карточки */}
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Категория */}
          {product.category && (
            <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
              {product.category}
            </span>
          )}
          
          {/* Название */}
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {product.name}
          </h3>
          
          {/* Описание */}
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}
          
          {/* Цена */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
          
          {/* Количество в наличии */}
          <div className="text-xs text-gray-500">
            {isOutOfStock ? (
              'Нет в наличии'
            ) : (
              `В наличии: ${product.stockQuantity} шт.`
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Футер с кнопками */}
      <CardFooter className="p-4 pt-0">
        <div className={`w-full ${showBuyNow && !isOutOfStock ? 'space-y-2' : ''}`}>
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isLoading}
            variant={isOutOfStock ? 'secondary' : 'default'}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Добавление...
              </div>
            ) : isOutOfStock ? (
              'Нет в наличии'
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                В корзину
              </div>
            )}
          </Button>
          
          {showBuyNow && !isOutOfStock && (
            <Button
              className="w-full"
              onClick={handleBuyNow}
              variant="outline"
              disabled={isLoading}
            >
              Купить сейчас
            </Button>
          )}
          
          {/* Дополнительные кнопки для корзины и оформления заказа */}
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => router.push('/cart')}
            >
              <ShoppingBag className="h-4 w-4 mr-1" />
              Корзина
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => router.push('/checkout')}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Оформить
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}