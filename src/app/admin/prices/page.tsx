import { Metadata } from 'next';
import BaseContainer from '@/components/BaseContainer';
import PriceManagement from '@/components/admin/PriceManagement';

export const metadata: Metadata = {
  title: 'Управление ценами | Админ-панель',
  description: 'Управление ценами на услуги и товары',
};

export default function PricesPage() {
  return (
    <BaseContainer>
      <PriceManagement />
    </BaseContainer>
  );
}