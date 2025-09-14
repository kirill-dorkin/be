'use client'

import BaseContainer from '@/components/BaseContainer';
import ProductManagement from '@/components/admin/ProductManagement';

const ProductsPageClient = () => {
  return (
    <BaseContainer className="py-8">
      <ProductManagement />
    </BaseContainer>
  );
};

export default ProductsPageClient;