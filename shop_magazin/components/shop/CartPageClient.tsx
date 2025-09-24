'use client'

import { useTranslations } from 'next-intl';
import BaseContainer from '@/components/BaseContainer';
import ShoppingCart from '@/components/shop/ShoppingCart';
import ClientHeader from '@/components/ClientHeader';

const CartPageClient = () => {
  const t = useTranslations('cart');

  return (
    <>
      <ClientHeader />
      <BaseContainer>
        <div className="pt-20 pb-8">
          <ShoppingCart />
        </div>
      </BaseContainer>
    </>
  );
};

export default CartPageClient;