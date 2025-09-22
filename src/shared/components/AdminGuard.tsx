'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSkeleton from '@/shared/ui/LoadingSkeleton';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Ждем загрузки сессии

    if (!session) {
      // Пользователь не авторизован - перенаправляем на логин
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (session.user?.role !== 'admin') {
      // Пользователь не администратор - перенаправляем на главную
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <LoadingSkeleton />;
  }

  if (!session || session.user?.role !== 'admin') {
    return <LoadingSkeleton />; // Показываем загрузку во время перенаправления
  }

  return <>{children}</>;
}