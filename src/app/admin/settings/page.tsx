import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import Settings from '@/components/admin/Settings';

export const metadata: Metadata = {
  title: 'Настройки | Админ-панель',
  description: 'Настройки и конфигурация системы',
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Настройки системы
          </h1>
          <p className="text-gray-600">
            Управление конфигурацией и параметрами приложения
          </p>
        </div>
        
        <Settings />
      </div>
    </div>
  );
}