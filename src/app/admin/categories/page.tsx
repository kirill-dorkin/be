import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';
import CategoryManagement from '@/components/admin/CategoryManagement';

export const metadata: Metadata = {
  title: 'Управление категориями - Админ панель',
  description: 'Управление категориями товаров и услуг'
};

export default function CategoriesPage() {
  return (
    <BaseContainer className="py-8">
      <CategoryManagement />
    </BaseContainer>
  );
}