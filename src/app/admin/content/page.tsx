import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import ContentManagement from '@/components/admin/ContentManagement';

export const metadata: Metadata = {
  title: 'Управление контентом | Админ-панель',
  description: 'CMS для управления статическими страницами сайта',
};

export default async function ContentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ContentManagement />
    </div>
  );
}