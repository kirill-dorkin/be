"use client";

import { useState, useRef, useEffect } from "react";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useFavorites, FavoriteItem } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import useCustomToast from "@/hooks/useCustomToast";
import { useTranslations } from "next-intl";

export default function FavoritesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { favoriteItems, loading, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const t = useTranslations();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleRemoveItem = async (productId: string) => {
    setUpdating(productId);
    try {
      await removeFromFavorites(productId);
      showSuccessToast({
        title: t('favorites.title'),
        description: t('favorites.removedFromFavorites')
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      showErrorToast({
        title: t('common.error'),
        description: t('common.error')
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    setUpdating(productId);
    try {
      await addToCart(productId, 1);
      showSuccessToast({
        title: t('products.addToCart'),
        description: t('products.addToCart')
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      showErrorToast({
        title: t('common.error'),
        description: t('common.error')
      });
    } finally {
      setUpdating(null);
    }
  };

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
    <div className="relative" ref={dropdownRef}>
      {/* Кнопка избранного */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 group hover:bg-pink-50 hover:border-pink-200 transition-all duration-300 ease-in-out transform hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Heart className="h-6 w-6 md:h-5 md:w-5 transition-colors duration-300 group-hover:text-pink-500 group-hover:fill-pink-100" />

      </Button>

      {/* Мобильная версия - полноэкранная */}
      {isOpen && (
        <>
        {/* Затемнение фона */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Мобильная панель снизу */}
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg z-50 max-h-[80vh] md:hidden flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{t('favorites.title')}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1"
              >
                ✕
              </Button>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[60vh] flex-1 touch-pan-y">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </div>
            ) : favoriteItems.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Heart className="h-16 w-16 md:h-12 md:w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 mb-4">{t('favorites.noFavorites')}</p>
                <Link href="/products">
                  <Button size="sm" onClick={() => setIsOpen(false)}>
                    {t('products.catalog')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {favoriteItems.map((item: FavoriteItem) => (
                  <div key={String(item.productId)} className="flex gap-3 p-3 border rounded-lg">
                    {/* Изображение */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {item.productInfo.images && item.productInfo.images.length > 0 ? (
                        <Image
                          src={item.productInfo.images[0]}
                          alt={item.productInfo.name}
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">{t('products.image')}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Информация о товаре */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.productInfo.name}</h4>
                      <p className="text-lg font-bold text-green-600 mb-2">{formatPrice(item.productInfo.price)}</p>
                      
                      {/* Кнопки действий */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-10 md:h-9"
                          onClick={() => handleAddToCart(String(item.productId))}
                          disabled={updating === String(item.productId)}
                        >
                          <ShoppingCart className="h-5 w-5 md:h-4 md:w-4 mr-1" />
                          {t('products.addToCart')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 md:h-9 md:w-9 p-0"
                          onClick={() => handleRemoveItem(String(item.productId))}
                          disabled={updating === String(item.productId)}
                        >
                          <Trash2 className="h-5 w-5 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {favoriteItems.length > 0 && (
            <div className="p-4 border-t bg-gray-50 flex-shrink-0">
              <Link href="/favorites" className="block">
                <Button 
                  className="w-full" 
                  onClick={() => setIsOpen(false)}
                >
                  {t('favorites.title')}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Десктопная версия - выпадающее меню */}
        <div className="absolute right-0 top-full mt-2 w-96 z-50 hidden md:block">
          <Card className="shadow-lg border">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              ) : favoriteItems.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Heart className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 mb-4">Нет избранных товаров</p>
                  <Link href="/products">
                    <Button size="sm" onClick={() => setIsOpen(false)}>
                      Перейти к покупкам
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Список товаров */}
                  <div className="max-h-80 min-h-[200px] overflow-y-auto px-4 touch-pan-y">
                    {favoriteItems.map((item: FavoriteItem) => (
                      <div key={String(item.productId)} className="flex gap-3 py-3 border-b last:border-b-0">
                        {/* Изображение */}
                        <div className="relative w-12 h-12 flex-shrink-0">
                          {item.productInfo.images && item.productInfo.images.length > 0 ? (
                            <Image
                              src={item.productInfo.images[0]}
                              alt={item.productInfo.name}
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
                          <h4 className="font-medium text-sm line-clamp-1">{item.productInfo.name}</h4>
                          <p className="text-sm text-green-600 font-medium mb-1">{formatPrice(item.productInfo.price)}</p>
                          
                          {/* Кнопки действий */}
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              className="h-6 text-xs px-2"
                              onClick={() => handleAddToCart(String(item.productId))}
                              disabled={updating === String(item.productId)}
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              В корзину
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleRemoveItem(String(item.productId))}
                              disabled={updating === String(item.productId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                  
                  {/* Кнопка перехода */}
                  <div className="p-4 border-t bg-gray-50">
                    <Link href="/favorites" className="block">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => setIsOpen(false)}
                      >
                        Посмотреть все избранные
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        </>
      )}
    </div>
  );
}