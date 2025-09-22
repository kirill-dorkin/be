'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuard from '@/shared/components/AdminGuard';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем на дашборд админки
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <AdminGuard>
      <div>Перенаправление...</div>
    </AdminGuard>
  );
}