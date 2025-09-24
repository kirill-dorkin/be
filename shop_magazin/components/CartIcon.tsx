'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CartIconProps {
  className?: string;
}

export default function CartIcon({ className = '' }: CartIconProps) {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        const totalItems = data.items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0;
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartCount();
    
    // Обновляем счетчик при изменении корзины
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    // Слушаем события обновления корзины
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return (
    <Link href="/cart" className={className}>
      <Button variant="outline" size="sm" className="relative p-2 hover:bg-primary hover:text-primary-foreground transition-colors">
        <ShoppingCart className="h-5 w-5" />
        {!loading && cartCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
          >
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}