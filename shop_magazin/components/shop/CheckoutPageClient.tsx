'use client'

import { useTranslations } from 'next-intl';
import BaseContainer from '@/components/BaseContainer';
import Checkout from '@/components/shop/Checkout';

const CheckoutPageClient = () => {
  const t = useTranslations('checkout');

  return (
    <BaseContainer>
      <div className="py-8">
        <Checkout />
      </div>
    </BaseContainer>
  );
};

export default CheckoutPageClient;