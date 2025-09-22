'use client';

import { useEffect } from 'react';
import { webVitalsMonitor } from '@/shared/lib/web-vitals';

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
    console.log('🔧 WebVitalsProvider: useEffect triggered', {
      NODE_ENV: process.env.NODE_ENV,
      enableInDevelopment,
      analyticsEndpoint
    });
    
    // Инициализируем мониторинг только в продакшене или если явно разрешено в разработке
    if (process.env.NODE_ENV === 'production' || enableInDevelopment) {
      console.log('✅ WebVitalsProvider: Initializing WebVitals monitor');
      webVitalsMonitor.init();
      
      // Устанавливаем кастомный endpoint если передан
      if (analyticsEndpoint) {
        console.log('🔗 WebVitalsProvider: Setting analytics endpoint:', analyticsEndpoint);
        webVitalsMonitor.analyticsEndpoint = analyticsEndpoint;
      }
    } else {
      console.log('❌ WebVitalsProvider: Skipping initialization (not production and not enabled in development)');
    }
  }, [enableInDevelopment, analyticsEndpoint]);

  return <>{children}</>;
}

export default WebVitalsProvider;