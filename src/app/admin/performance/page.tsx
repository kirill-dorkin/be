import { Metadata } from 'next';
import { PerformanceMetrics } from '@/components/performance-metrics';

export const metadata: Metadata = {
  title: 'Метрики производительности | Панель администратора',
  description: 'Мониторинг производительности в реальном времени и отслеживание Web Vitals',
};

export default function PerformancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PerformanceMetrics />
    </div>
  );
}