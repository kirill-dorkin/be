import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import CartPageClient from '@/components/shop/CartPageClient';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'cart' });
  
  return {
    title: t('metadata.title'),
    description: t('metadata.description')
  };
}

export default function CartPage() {
  return <CartPageClient />;
}