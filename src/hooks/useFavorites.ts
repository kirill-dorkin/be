'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import mongoose from 'mongoose';
import { IProduct } from '@/models/Product';

export interface FavoriteItem {
  productId: mongoose.Types.ObjectId;
  productInfo: IProduct;
  addedAt: string;
}

interface LocalFavoriteItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

const FAVORITES_STORAGE_KEY = 'guest_favorites';

export function useFavorites() {
  const { data: session } = useSession();
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Получение локального избранного из localStorage
  const getLocalFavorites = useCallback((): LocalFavoriteItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const items = stored ? JSON.parse(stored) : [];
      console.log('Favorites loaded from localStorage:', items.length, 'items');
      return items;
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      return [];
    }
  }, []);

  // Сохранение локального избранного в localStorage
  const saveLocalFavorites = useCallback((items: LocalFavoriteItem[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
      console.log('Favorites saved to localStorage:', items.length, 'items');
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, []);

  // Загрузка избранного с сервера (для авторизованных пользователей)
  const fetchServerFavorites = useCallback(async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        return data.items || [];
      }
    } catch (error) {
      console.error('Error fetching server favorites:', error);
    }
    return [];
  }, []);

  // Загрузка избранного
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      if (session?.user) {
        // Авторизованный пользователь - загружаем с сервера
        const serverItems = await fetchServerFavorites();
        setFavoriteItems(serverItems);
        setFavoriteCount(serverItems.length);
      } else {
        // Гостевой пользователь - загружаем из localStorage
        const localItems = getLocalFavorites();
        // Преобразуем локальные элементы в формат FavoriteItem
        const formattedItems = localItems.map(item => ({
          productId: new mongoose.Types.ObjectId(item.productId),
          productInfo: {
            _id: item.productId,
            name: item.name,
            price: item.price,
            images: [item.image]
          } as IProduct,
          addedAt: item.addedAt
        }));
        setFavoriteItems(formattedItems);
        setFavoriteCount(localItems.length);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user, fetchServerFavorites, getLocalFavorites]);

  // Добавление товара в избранное
  const addToFavorites = useCallback(async (productId: string, productData?: Partial<IProduct>) => {
    try {
      if (session?.user) {
        // Авторизованный пользователь - отправляем на сервер
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });

        if (response.ok) {
          await fetchFavorites(); // Перезагружаем избранное
          return true;
        }
      } else {
        // Гостевой пользователь - сохраняем в localStorage
        const localItems = getLocalFavorites();
        const existingItem = localItems.find(item => item.productId === productId);
        
        if (existingItem) {
          console.log('Product already in favorites:', productId);
          return false;
        }
        
        if (productData) {
          const newItem: LocalFavoriteItem = {
            productId,
            name: productData.name || '',
            price: productData.price || 0,
            image: productData.images?.[0] || '',
            addedAt: new Date().toISOString()
          };
          
          const updatedItems = [...localItems, newItem];
          saveLocalFavorites(updatedItems);
          console.log('Added to favorites:', productId);
          await fetchFavorites(); // Перезагружаем избранное
          return true;
        }
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
    return false;
  }, [session?.user, fetchFavorites, getLocalFavorites, saveLocalFavorites]);

  // Удаление товара из избранного
  const removeFromFavorites = useCallback(async (productId: string) => {
    if (!productId) return false;
    
    try {
      if (session?.user) {
        // Авторизованный пользователь - отправляем на сервер
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });

        if (response.ok) {
          await fetchFavorites(); // Перезагружаем избранное
          return true;
        }
      } else {
        // Гостевой пользователь - удаляем из localStorage
        const localItems = getLocalFavorites();
        const updatedItems = localItems.filter(item => item.productId !== productId);
        saveLocalFavorites(updatedItems);
        
        console.log('Removed from favorites:', productId);
        
        await fetchFavorites(); // Перезагружаем избранное
        return true;
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
    return false;
  }, [session?.user, fetchFavorites, getLocalFavorites, saveLocalFavorites]);

  // Проверка, находится ли товар в избранном
  const isInFavorites = useCallback((productId: string) => {
    return favoriteItems.some(item => String(item.productId) === productId);
  }, [favoriteItems]);

  // Очистка избранного
  const clearFavorites = useCallback(async () => {
    try {
      if (session?.user) {
        // Авторизованный пользователь - отправляем на сервер
        const response = await fetch('/api/favorites/clear', {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchFavorites();
          return true;
        }
      } else {
        // Гостевой пользователь - очищаем localStorage
        saveLocalFavorites([]);
        
        console.log('Cleared all favorites');
        
        await fetchFavorites();
        return true;
      }
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw error;
    }
    return false;
  }, [session?.user, fetchFavorites, saveLocalFavorites]);

  // Загрузка избранного при монтировании компонента или изменении сессии
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favoriteItems,
    favoriteCount,
    loading,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    clearFavorites,
    refetch: fetchFavorites
  };
}