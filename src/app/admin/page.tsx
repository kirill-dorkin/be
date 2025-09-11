import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Админ панель - Управление магазином',
  description: 'Панель администратора для управления интернет-магазином'
};

export default function AdminPage() {
  return (
    <BaseContainer className="py-8">
      <AdminDashboard />
    </BaseContainer>
  );
}