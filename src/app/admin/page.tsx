import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Админ панель - Best Electronics',
  description: 'Панель администратора для управления системой'
};

export default function AdminPage() {
  return (
    <BaseContainer className="py-8">
      <AdminDashboard />
    </BaseContainer>
  );
}