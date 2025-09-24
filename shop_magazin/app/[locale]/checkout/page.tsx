import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import CheckoutPageClient from '@/components/shop/CheckoutPageClient';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'checkout' });
  
  return {
    title: t('metadata.title'),
    description: t('metadata.description')
  };
}

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}