import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import OrdersPageClient from '@/components/admin/OrdersPageClient';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin.orders' });
  
  return {
    title: t('metadata.title'),
    description: t('metadata.description')
  };
}

export default function AdminOrdersPage() {
  return <OrdersPageClient />;
}