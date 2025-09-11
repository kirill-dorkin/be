import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';
import ProductManagement from '@/components/admin/ProductManagement';

export const metadata: Metadata = {
  title: 'Управление товарами - Админ панель',
  description: 'Добавление, редактирование и удаление товаров в интернет-магазине'
};

export default function AdminProductsPage() {
  return (
    <BaseContainer className="py-8">
      <ProductManagement />
    </BaseContainer>
  );
}