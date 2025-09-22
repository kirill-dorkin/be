'use client';

import { useEffect, useState } from 'react';

export function PerformanceMetricsWrapper() {
  const [isClient, setIsClient] = useState(false);
  const [PerformanceMetrics, setPerformanceMetrics] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    import('./PerformanceMetrics').then((mod) => {
      setPerformanceMetrics(() => mod.PerformanceMetrics);
    });
  }, []);

  if (!isClient || !PerformanceMetrics) {
    return null;
  }

  return <PerformanceMetrics />;
}