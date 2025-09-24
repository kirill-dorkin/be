"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type FavoriteItem = {
  productId: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
};

type FavoriteProductInput = {
  _id?: string;
  slug: string;
  title: string;
  price: number;
  currency?: string;
  images?: string[];
};

interface FavoritesContextValue {
  favorites: FavoriteItem[];
  favoritesCount: number;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: FavoriteProductInput) => void;
  addFavorite: (product: FavoriteProductInput) => void;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const STORAGE_KEY = "favorites:v1";

function normalizeProduct(product: FavoriteProductInput): FavoriteItem {
  const productId = product._id ?? product.slug;
  return {
    productId,
    slug: product.slug,
    title: product.title,
    price: product.price,
    currency: product.currency ?? "RUB",
    image: product.images?.[0],
  };
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FavoriteItem[];
        if (Array.isArray(parsed)) setFavorites(parsed);
      }
    } catch (error) {
      console.warn("Failed to load favorites", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.warn("Failed to persist favorites", error);
    }
  }, [favorites]);

  const addFavorite = useCallback((product: FavoriteProductInput) => {
    setFavorites((prev) => {
      const normalized = normalizeProduct(product);
      if (prev.some((item) => item.productId === normalized.productId)) {
        return prev;
      }
      return [...prev, normalized];
    });
  }, []);

  const removeFavorite = useCallback((productId: string) => {
    setFavorites((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const toggleFavorite = useCallback((product: FavoriteProductInput) => {
    const productId = product._id ?? product.slug;
    setFavorites((prev) => {
      if (prev.some((item) => item.productId === productId)) {
        return prev.filter((item) => item.productId !== productId);
      }
      return [...prev, normalizeProduct(product)];
    });
  }, []);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  const value = useMemo<FavoritesContextValue>(() => {
    const favoritesCount = favorites.length;
    const isFavorite = (productId: string) => favorites.some((item) => item.productId === productId);
    return {
      favorites,
      favoritesCount,
      isFavorite,
      toggleFavorite,
      addFavorite,
      removeFavorite,
      clearFavorites,
    };
  }, [favorites, toggleFavorite, addFavorite, removeFavorite, clearFavorites]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

