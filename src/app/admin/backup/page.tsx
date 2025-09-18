import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import BackupDashboard from '@/components/admin/BackupDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Резервное копирование | Админ панель',
  description: 'Управление резервными копиями и восстановление данных',
};

export default async function BackupPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackupDashboard />
    </div>
  );
}