'use client';

import { ReactNode } from 'react';
import IntelligentPreloader from './IntelligentPreloader';

interface PerformanceProviderProps {
  children: ReactNode;
  enablePreloader?: boolean;
  debug?: boolean;
}

const defaultPreloadConfig = {
  routes: [
    '/dashboard',
    '/users',
    '/services',
    '/tasks',
    '/analytics',
    '/settings'
  ],
  images: [
    '/images/logo.svg',
    '/images/hero-bg.webp',
    '/images/dashboard-preview.webp'
  ],
  scripts: [],
  stylesheets: [],
  priority: 'low' as const,
  threshold: 0.1,
  rootMargin: '50px'
};

export default function PerformanceProvider({ 
  children, 
  enablePreloader = true,
  debug = false 
}: PerformanceProviderProps) {
  return (
    <>
      {children}
      <IntelligentPreloader 
        config={defaultPreloadConfig}
        enabled={enablePreloader}
        debug={debug}
      />
    </>
  );
}