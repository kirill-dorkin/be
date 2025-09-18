import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CacheManagement from '@/components/admin/CacheManagement';

export const metadata: Metadata = {
  title: 'Управление кэшем | Админ панель',
  description: 'Управление системой кэширования и оптимизация производительности'
};

export default async function CachePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/cache');
  }
  
  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Управление кэшем</h1>
        <p className="text-muted-foreground mt-2">
          Мониторинг и управление системой кэширования, оптимизация производительности
        </p>
      </div>
      
      <CacheManagement />
    </div>
  );
}