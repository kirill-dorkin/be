import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';

export const metadata: Metadata = {
  title: 'Управление устройствами - Админ панель',
  description: 'Управление информацией об устройствах и их характеристиках'
};

export default function DevicesPage() {
  return (
    <BaseContainer className="py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Управление устройствами</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Здесь будет интерфейс управления устройствами.</p>
        </div>
      </div>
    </BaseContainer>
  );
}