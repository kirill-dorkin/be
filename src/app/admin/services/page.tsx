import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';

export const metadata: Metadata = {
  title: 'Управление услугами - Админ панель',
  description: 'Управление каталогом услуг и их стоимостью'
};

export default function ServicesPage() {
  return (
    <BaseContainer className="py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Управление услугами</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Здесь будет интерфейс управления услугами.</p>
        </div>
      </div>
    </BaseContainer>
  );
}