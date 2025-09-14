import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Дашборд - Админ панель',
  description: 'Главная панель администратора'
};

export default function DashboardPage() {
  return (
    <BaseContainer className="py-8">
      <AdminDashboard />
    </BaseContainer>
  );
}