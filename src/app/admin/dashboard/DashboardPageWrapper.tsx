'use client';

import { Suspense } from "react";
import AdminGuard from '@/shared/components/AdminGuard';
import LoadingSkeleton from "@/shared/ui/LoadingSkeleton";

interface DashboardPageWrapperProps {
  children: React.ReactNode;
}

export default function DashboardPageWrapper({ children }: DashboardPageWrapperProps) {
  return (
    <AdminGuard>
      <Suspense fallback={<LoadingSkeleton />}>
        {children}
      </Suspense>
    </AdminGuard>
  );
}