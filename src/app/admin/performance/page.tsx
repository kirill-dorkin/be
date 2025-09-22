import { Metadata } from 'next';
import { PerformanceMetrics } from '@/components/performance-metrics';

export const metadata: Metadata = {
  title: 'Performance Metrics | Admin Dashboard',
  description: 'Real-time performance monitoring and Web Vitals tracking',
};

export default function PerformancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PerformanceMetrics />
    </div>
  );
}