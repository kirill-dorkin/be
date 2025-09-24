"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CartItem } from "@/shared/types";

type CartProductInput = {
  _id?: string;
  slug: string;
  title: string;
  price: number;
  currency?: string;
  images?: string[];
};

type StoredCartItem = Partial<CartItem> & {
  productId?: string;
};

type CartContextValue = {
  items: CartItem[];
  total: number;
  addToCart: (product: CartProductInput, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setQuantity: (productId: string, qty: number) => void;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function normalizeCartItem(item: StoredCartItem): CartItem | null {
  if (!item.productId) return null;
  return {
    productId: item.productId,
    slug: item.slug ?? item.productId,
    title: item.title ?? "Товар",
    price: item.price ?? 0,
    quantity: Math.max(1, item.quantity ?? 1),
    currency: item.currency ?? "RUB",
    image: item.image,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart:v1");
      if (raw) {
        const parsed = JSON.parse(raw) as StoredCartItem[];
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .map((item) => normalizeCartItem(item))
            .filter((item): item is CartItem => Boolean(item));
          setItems(normalized);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cart:v1", JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = useCallback((product: CartProductInput, qty: number = 1) => {
    setItems((prev) => {
      const productId = product._id ?? product.slug;
      const currency = product.currency ?? "RUB";
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [
        ...prev,
        {
          productId,
          slug: product.slug,
          title: product.title,
          price: product.price,
          currency,
          image: product.images?.[0],
          quantity: qty,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = useMemo(() => calculateTotal(items), [items]);

  const setQuantity = useCallback((productId: string, qty: number) => {
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i));
  }, []);

  const itemCount = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);

  const value = useMemo(() => ({ items, total, addToCart, removeFromCart, clearCart, setQuantity, itemCount }), [items, total, addToCart, removeFromCart, clearCart, setQuantity, itemCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
