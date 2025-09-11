import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';
import ShoppingCart from '@/components/shop/ShoppingCart';

export const metadata: Metadata = {
  title: 'Корзина - Интернет-магазин',
  description: 'Просмотр и управление товарами в корзине'
};

export default function CartPage() {
  return (
    <BaseContainer>
      <div className="py-8">
        <ShoppingCart />
      </div>
    </BaseContainer>
  );
}