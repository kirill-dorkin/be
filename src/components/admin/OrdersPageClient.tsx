'use client'

import { useTranslations } from 'next-intl';
import BaseContainer from '@/components/BaseContainer';
import OrderManagement from '@/components/admin/OrderManagement';

const OrdersPageClient = () => {
  const t = useTranslations('admin.orders');

  return (
    <BaseContainer className="py-8">
      <OrderManagement />
    </BaseContainer>
  );
};

export default OrdersPageClient;