'use client'

import { useTranslations } from 'next-intl';
import BaseContainer from '@/components/BaseContainer';
import ProductManagement from '@/components/admin/ProductManagement';

const ProductsPageClient = () => {
  const t = useTranslations('admin.products');

  return (
    <BaseContainer className="py-8">
      <ProductManagement />
    </BaseContainer>
  );
};

export default ProductsPageClient;