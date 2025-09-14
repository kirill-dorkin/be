import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';

export const metadata: Metadata = {
  title: 'Управление товарами - Админ панель',
  description: 'Управление каталогом товаров и их характеристиками'
};

export default function ProductsPage() {
  return (
    <BaseContainer className="py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Управление товарами</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Здесь будет интерфейс управления товарами.</p>
        </div>
      </div>
    </BaseContainer>
  );
}