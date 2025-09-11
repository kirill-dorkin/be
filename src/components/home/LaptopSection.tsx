'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/shop/ProductCard';
import { IProduct } from '@/models/Product';
import BaseContainer from '@/components/BaseContainer';
import useCustomToast from '@/hooks/useCustomToast';
import { Button } from '@/components/ui/button';

interface LaptopSectionProps {
  className?: string;
}

export default function LaptopSection({ className = '' }: LaptopSectionProps) {
  const [laptops, setLaptops] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showErrorToast } = useCustomToast();

  useEffect(() => {
    const fetchLaptops = async () => {
      try {
        const response = await fetch('/api/products?category=laptop&limit=10');
        if (!response.ok) {
          throw new Error('Ошибка загрузки ноутбуков');
        }
        const data = await response.json();
        setLaptops(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchLaptops();
  }, []);



  const handleViewDetails = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleBuyNow = async (productId: string) => {
    try {
      // Добавляем товар в корзину
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении в корзину');
      }

      // Переходим на страницу оформления заказа
      router.push('/checkout');
    } catch (err) {
      showErrorToast({ 
        title: 'Ошибка', 
        description: err instanceof Error ? err.message : 'Неизвестная ошибка' 
      });
    }
  };

  if (loading) {
    return (
      <section className={`py-20 bg-muted/50 ${className}`}>
        <BaseContainer>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Загрузка ноутбуков...</p>
          </div>
        </BaseContainer>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-20 bg-muted/50 ${className}`}>
        <BaseContainer>
          <div className="text-center">
            <p className="text-destructive">{error}</p>
          </div>
        </BaseContainer>
      </section>
    );
  }

  return (
    <section className={`py-20 bg-muted/50 ${className}`}>
      <BaseContainer>
        <div className="text-center mb-12">
          <h2 className="apple-display-small text-gray-900 mb-6">
            Наши ноутбуки
          </h2>
          <p className="apple-subheadline text-gray-600 max-w-2xl mx-auto">
            Широкий выбор современных ноутбуков для работы, учебы и развлечений. 
            Найдите идеальное устройство для ваших потребностей.
          </p>
        </div>
        
        {laptops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {laptops.map((laptop) => (
              <div key={laptop._id?.toString() || Math.random().toString()} className="transform transition-transform hover:scale-105">
                <ProductCard 
                  product={laptop} 
                  onViewDetails={handleViewDetails}
                  onBuyNow={handleBuyNow}
                  showBuyNow={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">Ноутбуки не найдены</p>
          </div>
        )}
        
        <div className="text-center mt-12">
          <Button size="lg" asChild className="apple-button bg-black text-white hover:bg-gray-800 rounded-full px-8 py-3 transition-all duration-200 border-0 shadow-sm hover:shadow-md">
            <a href="/products?category=laptop">
              Посмотреть все ноутбуки
            </a>
          </Button>
        </div>
      </BaseContainer>
    </section>
  );
}