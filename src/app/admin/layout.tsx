'use client'
import { ReactNode, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { preloadRoleComponents } from "@/shared/lib/code-splitting";
import LoadingSkeleton from "@/shared/ui/LoadingSkeleton";
import useAppContext from "@/shared/lib/useAppContext";

// Обычный импорт Sidebar для диагностики
import Sidebar from "@/features/dashboard/Sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toggleSidebar } = useAppContext();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.role !== "admin") {
      router.push("/");
      return;
    }

    // Предзагружаем admin компоненты после успешной авторизации
    preloadRoleComponents("admin");
  }, [session, status, router]);

  // Показываем скелетон во время загрузки
  if (status === "loading") {
    return (
      <div className="flex max-h-svh">
        <LoadingSkeleton className="w-64 h-full" />
        <div className="flex-1 p-6">
          <LoadingSkeleton className="h-8 w-48 mb-4" />
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Редирект для неавторизованных пользователей
  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex max-h-svh">
      <Suspense fallback={<LoadingSkeleton className="w-64 h-full" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 overflow-auto">
        {/* Контент */}
        <div className="p-6">
          <Suspense fallback={
            <div>
              <LoadingSkeleton className="h-8 w-48 mb-4" />
              <LoadingSkeleton className="h-64 w-full" />
            </div>
          }>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
