'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import mongoose from 'mongoose';
import { ICartItem } from '@/models/Cart';
import { IProduct } from '@/models/Product';

interface CartItemWithProduct extends ICartItem {
  product: IProduct;
}

interface LocalCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const CART_STORAGE_KEY = 'guest_cart';

export function useCart() {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Получение локальной корзины из localStorage
  const getLocalCart = useCallback((): LocalCartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Сохранение локальной корзины в localStorage
  const saveLocalCart = useCallback((items: LocalCartItem[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, []);

  // Загрузка корзины с сервера (для авторизованных пользователей)
  const fetchServerCart = useCallback(async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        return data.items || [];
      }
    } catch (error) {
      console.error('Error fetching server cart:', error);
    }
    return [];
  }, []);

  // Загрузка корзины
  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      if (session?.user) {
        // Авторизованный пользователь - загружаем с сервера
        const serverItems = await fetchServerCart();
        setCartItems(serverItems);
        const totalItems = serverItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } else {
        // Гостевой пользователь - загружаем из localStorage
        const localItems = getLocalCart();
        // Преобразуем локальные элементы в формат CartItemWithProduct
        const formattedItems = localItems.map(item => ({
          ...item,
          productId: new mongoose.Types.ObjectId(item.productId),
          product: {
            _id: item.productId,
            name: item.name,
            price: item.price,
            images: [item.image]
          } as IProduct
        }));
        setCartItems(formattedItems);
        const totalItems = localItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user, fetchServerCart, getLocalCart]);

  // Добавление товара в корзину
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (session?.user) {
      // Авторизованный пользователь - отправляем на сервер
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при добавлении в корзину');
      }
      
      await fetchCart();
    } else {
      // Гостевой пользователь - сохраняем в localStorage
      // Сначала получаем информацию о товаре
      const productResponse = await fetch(`/api/products/${productId}`);
      if (!productResponse.ok) {
        throw new Error('Товар не найден');
      }
      
      const product = await productResponse.json();
      const localCart = getLocalCart();
      
      const existingItemIndex = localCart.findIndex(item => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        localCart[existingItemIndex].quantity += quantity;
      } else {
        localCart.push({
          productId,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images[0] || ''
        });
      }
      
      saveLocalCart(localCart);
      await fetchCart();
    }
    
    // Отправляем событие обновления корзины
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }, [session?.user, fetchCart, getLocalCart, saveLocalCart]);

  // Обновление количества товара
  const updateQuantity = useCallback(async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    if (session?.user) {
      // Авторизованный пользователь
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при обновлении количества');
      }
      
      await fetchCart();
    } else {
      // Гостевой пользователь
      const localCart = getLocalCart();
      const itemIndex = localCart.findIndex(item => item.productId === productId);
      
      if (itemIndex >= 0) {
        localCart[itemIndex].quantity = newQuantity;
        saveLocalCart(localCart);
        await fetchCart();
      }
    }
    
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }, [session?.user, fetchCart, getLocalCart, saveLocalCart]);

  // Удаление товара из корзины
  const removeFromCart = useCallback(async (productId: string) => {
    if (session?.user) {
      // Авторизованный пользователь
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при удалении товара');
      }
      
      await fetchCart();
    } else {
      // Гостевой пользователь
      const localCart = getLocalCart();
      const filteredCart = localCart.filter(item => item.productId !== productId);
      saveLocalCart(filteredCart);
      await fetchCart();
    }
    
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }, [session?.user, fetchCart, getLocalCart, saveLocalCart]);

  // Очистка корзины
  const clearCart = useCallback(async () => {
    if (session?.user) {
      // Авторизованный пользователь
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при очистке корзины');
      }
      
      await fetchCart();
    } else {
      // Гостевой пользователь
      saveLocalCart([]);
      await fetchCart();
    }
    
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }, [session?.user, fetchCart, saveLocalCart]);

  // Загрузка корзины при изменении сессии
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Слушаем события обновления корзины
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [fetchCart]);

  return {
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart
  };
}