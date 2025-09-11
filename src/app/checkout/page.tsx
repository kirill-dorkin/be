import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';
import Checkout from '@/components/shop/Checkout';

export const metadata: Metadata = {
  title: 'Оформление заказа - Интернет-магазин',
  description: 'Оформление заказа и выбор способа доставки'
};

export default function CheckoutPage() {
  return (
    <BaseContainer>
      <div className="py-8">
        <Checkout />
      </div>
    </BaseContainer>
  );
}