import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin');
  
  return {
    title: t('title'),
    description: t('subtitle')
  };
}

export default function AdminPage() {
  return (
    <BaseContainer className="py-8">
      <AdminDashboard />
    </BaseContainer>
  );
}