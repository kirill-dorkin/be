import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ApiIntegrations from '@/components/admin/ApiIntegrations';

export const metadata: Metadata = {
  title: 'API Интеграции | Админ-панель',
  description: 'Управление интеграциями с внешними API и сервисами',
};

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }
  
  return (
    <div className="container mx-auto py-6">
      <ApiIntegrations />
    </div>
  );
}