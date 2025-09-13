'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ShoppingCart, Heart, Eye, ShoppingBag } from 'lucide-react';
import { IProduct } from '@/models/Product';
import useCustomToast from '@/hooks/useCustomToast';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useTranslations } from 'next-intl';

interface ProductCardProps {
  product: IProduct;
  onViewDetails?: (productId: string) => void;
  onBuyNow?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  showBuyNow?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  onViewDetails,
  onBuyNow,
  onAddToCart,
  showBuyNow = false,
  className = ''
}: ProductCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const t = useTranslations('products');
  
  const isFavorite = isInFavorites(String(product._id));

  const handleAddToCart = async () => {
    if (onAddToCart) {
      onAddToCart(String(product._id));
      return;
    }
    
    setIsLoading(true);
    try {
      await addToCart(String(product._id), 1);
      setIsAddedToCart(true);
      showSuccessToast({ title: t('success'), description: t('addedToCart') });
      // Сбросить состояние через 3 секунды
      setTimeout(() => setIsAddedToCart(false), 3000);
    } catch {
      showErrorToast({ title: t('error'), description: t('addToCartError') });
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

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(String(product._id));
        showSuccessToast({
          title: t('favorites'),
          description: t('removedFromFavorites')
        });
      } else {
        await addToFavorites(String(product._id), {
          name: product.name,
          price: product.price,
          images: product.images
        });
        showSuccessToast({
          title: t('favorites'),
          description: t('addedToFavorites')
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showErrorToast({
        title: t('error'),
        description: t('favoritesError')
      });
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
            <span className="text-gray-400">{t('noImage')}</span>
          </div>
        )}
        
        {/* Бейджи */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isOutOfStock && (
            <span className="inline-flex items-center rounded-full border border-transparent bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              {t('outOfStock')}
            </span>
          )}
          {isLowStock && (
            <span className="inline-flex items-center rounded-full border border-transparent bg-gray-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              {t('lowStock')}
            </span>
          )}
        </div>
        
        {/* Кнопки действий */}
        <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            className="h-10 w-10 md:h-8 md:w-8 p-0"
            onClick={toggleFavorite}
          >
            <Heart
              className={`h-6 w-6 md:h-4 md:w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-10 w-10 md:h-8 md:w-8 p-0"
            onClick={handleViewDetails}
          >
            <Eye className="h-6 w-6 md:h-4 md:w-4" />
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
              t('outOfStock')
            ) : (
              t('inStock', { count: product.stockQuantity })
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Футер с кнопками */}
      <CardFooter className="p-4 pt-0">
        <div className={`w-full ${showBuyNow && !isOutOfStock ? 'space-y-2' : ''}`}>
          <Button
            className="w-full"
            onClick={isAddedToCart ? () => router.push('/cart') : handleAddToCart}
            disabled={isOutOfStock || isLoading}
            variant={isOutOfStock ? 'secondary' : isAddedToCart ? 'outline' : 'default'}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t('adding')}
              </div>
            ) : isOutOfStock ? (
              t('outOfStock')
            ) : isAddedToCart ? (
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 md:h-4 md:w-4" />
                {t('goToCart')}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 md:h-4 md:w-4" />
                {t('addToCart')}
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
              {t('buyNow')}
            </Button>
          )}
          

        </div>
      </CardFooter>
    </Card>
  );
}