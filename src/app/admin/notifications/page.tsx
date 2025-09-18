import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import NotificationSystem from '@/components/admin/NotificationSystem';

export const metadata: Metadata = {
  title: 'Уведомления | Админ-панель',
  description: 'Система уведомлений и коммуникации с пользователями',
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Система уведомлений
          </h1>
          <p className="text-gray-600">
            Управление уведомлениями и коммуникацией с пользователями
          </p>
        </div>
        
        <NotificationSystem />
      </div>
    </div>
  );
}