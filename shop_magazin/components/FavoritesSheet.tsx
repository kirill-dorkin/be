'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import useCustomToast from '@/hooks/useCustomToast';
import { useTranslations } from 'next-intl';

interface FavoritesSheetProps {
  className?: string;
}

export default function FavoritesSheet({ className = '' }: FavoritesSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { favoriteItems, favoriteCount, loading, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const t = useTranslations('favorites');

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Обработчик удаления товара из избранного
  const handleRemoveItem = async (productId: string) => {
    setUpdating(productId);
    try {
      await removeFromFavorites(productId);
      showSuccessToast({
        title: t('success'),
        description: t('removedFromFavorites')
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      showErrorToast({
        title: t('error'),
        description: t('removeError')
      });
    } finally {
      setUpdating(null);
    }
  };

  // Обработчик добавления товара в корзину
  const handleAddToCart = async (productId: string) => {
    setUpdating(productId);
    try {
      await addToCart(productId, 1);
      showSuccessToast({
        title: t('success'),
        description: t('addedToCart')
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      showErrorToast({
        title: t('error'),
        description: t('addToCartError')
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative p-2 group hover:bg-pink-50 hover:border-pink-200 transition-all duration-300 ease-in-out transform hover:scale-105 ${className}`}
        >
          <Heart className="h-6 w-6 md:h-5 md:w-5 transition-colors duration-300 group-hover:text-pink-500 group-hover:fill-pink-100" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="bottom" 
        className="h-[85vh] max-h-[85vh] p-0 rounded-t-xl border-t-2 border-gray-200 bg-white animate-in slide-in-from-bottom-full duration-300 ease-out z-50"
      >
        {/* Заголовок */}
        <SheetHeader className="p-4 pb-2 border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-pink-500" />
              <div>
                <SheetTitle className="text-lg font-semibold text-left">
                  {t('title')}
                </SheetTitle>
                <SheetDescription className="text-sm text-gray-600 text-left">
                  {favoriteCount === 0 
                    ? t('noFavorites')
                    : t('itemsCount', { count: favoriteCount })
                  }
                </SheetDescription>
              </div>
            </div>
            
            {/* Индикатор для свайпа */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto absolute top-2 left-1/2 transform -translate-x-1/2" />
          </div>
        </SheetHeader>

        {/* Контент */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          ) : favoriteItems.length === 0 ? (
            <div className="text-center py-12 px-4 animate-in fade-in duration-500">
              <Heart className="h-20 w-20 mx-auto text-gray-300 mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {t('noFavorites')}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {t('emptyDescription')}
              </p>
              <Link href="/products">
                <Button 
                  size="lg" 
                  onClick={() => setIsOpen(false)}
                  className="bg-pink-500 hover:bg-pink-600 transform hover:scale-105 transition-all duration-200"
                >
                  {t('continueShopping')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="p-4 space-y-4">
                {favoriteItems.map((item, index) => (
                  <div 
                    key={String(item.productId)} 
                    className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] animate-in slide-in-from-left"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Изображение товара */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      {item.productInfo.images && item.productInfo.images.length > 0 ? (
                        <Image
                          src={item.productInfo.images[0]}
                          alt={item.productInfo.name}
                          fill
                          className="object-cover rounded-lg transition-transform duration-300 hover:scale-110"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">{t('noPhoto')}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Информация о товаре */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/products/${item.productId}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <h4 className="font-semibold text-gray-900 line-clamp-2 hover:text-pink-600 transition-colors duration-200">
                          {item.productInfo.name}
                        </h4>
                      </Link>
                      
                      <p className="text-lg font-bold text-green-600 mt-1">
                        {formatPrice(item.productInfo.price)}
                      </p>
                      
                      {/* Кнопки действий */}
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105 transition-all duration-200"
                          onClick={() => handleAddToCart(String(item.productId))}
                          disabled={updating === String(item.productId)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {t('addToCart')}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-2 border-red-200 hover:bg-red-50 hover:border-red-300 transform hover:scale-110 transition-all duration-200"
                          onClick={() => handleRemoveItem(String(item.productId))}
                          disabled={updating === String(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Нижняя панель с кнопкой */}
              <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200">
                <Link href="/favorites" className="block">
                  <Button 
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 text-lg font-semibold"
                    size="lg"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('viewAll')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}