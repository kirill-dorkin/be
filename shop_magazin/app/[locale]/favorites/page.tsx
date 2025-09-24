"use client";

import { useState } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BaseContainer from '@/components/BaseContainer';
import Image from 'next/image';
import Link from 'next/link';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import useCustomToast from '@/hooks/useCustomToast';

export default function FavoritesPage() {
  const [updating, setUpdating] = useState<string | null>(null);
  const { favoriteItems, removeFromFavorites, loading } = useFavorites();
  const { addToCart } = useCart();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };



  const handleRemoveFromFavorites = async (productId: string) => {
    setUpdating(productId);
    try {
      await removeFromFavorites(productId);
      showSuccessToast({
        title: 'Успешно',
        description: 'Товар удален из избранного',
      });
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось удалить товар из избранного',
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
        title: 'Успешно',
        description: 'Товар добавлен в корзину',
      });
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось добавить товар в корзину',
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <BaseContainer>
        <div className="py-8">
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        </div>
      </BaseContainer>
    );
  }

  return (
    <BaseContainer>
      <div className="py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">Избранные товары</h1>
          </div>
          <p className="text-gray-600">
            {favoriteItems.length === 0 
              ? 'У вас пока нет избранных товаров'
              : `Избранных товаров: ${favoriteItems.length}`
            }
          </p>
        </div>

        {favoriteItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              Нет избранных товаров
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Добавляйте товары в избранное, чтобы не потерять их и быстро найти позже
            </p>
            <Link href="/products">
              <Button size="lg">
                Перейти к покупкам
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteItems.map((item) => (
              <Card key={String(item.productId)} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {/* Изображение товара */}
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                    {item.productInfo.images && item.productInfo.images.length > 0 ? (
                      <Image
                        src={item.productInfo.images[0]}
                        alt={item.productInfo.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">Нет изображения</span>
                      </div>
                    )}
                    
                    {/* Кнопка удаления из избранного */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-sm"
                      onClick={() => handleRemoveFromFavorites(String(item.productId))}
                      disabled={updating === String(item.productId)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  {/* Информация о товаре */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
                      {item.productInfo.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(item.productInfo.price)}
                      </span>
                    </div>

                    {/* Кнопки действий */}
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => handleAddToCart(String(item.productId))}
                        disabled={updating === String(item.productId)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Добавить в корзину
                      </Button>
                      
                      <Link href={`/products/${String(item.productId)}`} className="block">
                        <Button variant="outline" className="w-full">
                          Подробнее
                        </Button>
                      </Link>
                    </div>
                    
                    <p className="text-xs text-gray-400">
                      Добавлено: {new Date(item.addedAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </BaseContainer>
  );
}