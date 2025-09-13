import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ProductsPageClient from '@/components/admin/ProductsPageClient';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin.products' });
  
  return {
    title: t('metadata.title'),
    description: t('metadata.description')
  };
}

export default function AdminProductsPage() {
  return <ProductsPageClient />;
}