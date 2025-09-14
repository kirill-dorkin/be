'use client'

import BaseContainer from '@/components/BaseContainer';
import OrderManagement from '@/components/admin/OrderManagement';

const OrdersPageClient = () => {
  return (
    <BaseContainer className="py-8">
      <OrderManagement />
    </BaseContainer>
  );
};

export default OrdersPageClient;