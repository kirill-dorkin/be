import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';

export const metadata: Metadata = {
  title: 'Управление категориями - Админ панель',
  description: 'Управление категориями товаров и услуг'
};

export default function CategoriesPage() {
  return (
    <BaseContainer className="py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Управление категориями</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Здесь будет интерфейс управления категориями.</p>
        </div>
      </div>
    </BaseContainer>
  );
}