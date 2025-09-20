'use client';

import { useEffect } from 'react';
import { webVitalsMonitor } from '@/lib/web-vitals';

interface WebVitalsProviderProps {
  children: React.ReactNode;
  enableInDevelopment?: boolean;
  analyticsEndpoint?: string;
}

export function WebVitalsProvider({ 
  children, 
  enableInDevelopment = false,
  analyticsEndpoint = '/api/analytics/web-vitals'
}: WebVitalsProviderProps) {
  useEffect(() => {
    // Инициализируем мониторинг только в продакшене или если явно разрешено в разработке
    if (process.env.NODE_ENV === 'production' || enableInDevelopment) {
      webVitalsMonitor.init();
      
      // Устанавливаем кастомный endpoint если передан
      if (analyticsEndpoint) {
        // @ts-expect-error - доступ к приватному свойству для конфигурации
        webVitalsMonitor.analyticsEndpoint = analyticsEndpoint;
      }
    }
  }, [enableInDevelopment, analyticsEndpoint]);

  return <>{children}</>;
}

export default WebVitalsProvider;