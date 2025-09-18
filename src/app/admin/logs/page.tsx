import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LoggingSystem from '@/components/admin/LoggingSystem';

export const metadata: Metadata = {
  title: 'Логи и мониторинг | Админ-панель',
  description: 'Система логов и мониторинга активности',
};

export default async function LogsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <LoggingSystem />
    </div>
  );
}