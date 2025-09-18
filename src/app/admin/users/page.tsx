import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';
import EmployeeManagement from '@/components/admin/EmployeeManagement';

export const metadata: Metadata = {
  title: 'Управление сотрудниками - Админ панель',
  description: 'Управление сотрудниками и их правами в системе'
};

export default function UsersPage() {
  return (
    <BaseContainer className="py-8">
      <EmployeeManagement />
    </BaseContainer>
  );
}