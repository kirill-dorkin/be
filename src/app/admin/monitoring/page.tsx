import { Metadata } from 'next';
import MonitoringDashboard from '@/components/admin/MonitoringDashboard';

export const metadata: Metadata = {
  title: 'Мониторинг системы | Админ панель',
  description: 'Мониторинг производительности системы, логирование и управление алертами',
};

export default function MonitoringPage() {
  return (
    <div className="container mx-auto py-6">
      <MonitoringDashboard />
    </div>
  );
}