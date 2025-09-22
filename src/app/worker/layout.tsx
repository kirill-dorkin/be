'use client'
import { ReactNode, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { preloadRoleComponents } from "@/shared/lib/code-splitting";
import LoadingSkeleton from "@/shared/ui/LoadingSkeleton";

// Временно используем обычный импорт
import Sidebar from "@/features/dashboard/Sidebar";

export default function WorkerLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.role !== "worker") {
      router.push("/");
      return;
    }

    // Предзагружаем worker компоненты после успешной авторизации
    preloadRoleComponents("worker");
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
  if (session?.user?.role !== "worker") {
    return null;
  }

  return (
    <div className="flex max-h-svh">
      <Suspense fallback={<LoadingSkeleton className="w-64 h-full" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 overflow-auto">
        <Suspense fallback={
          <div className="p-6">
            <LoadingSkeleton className="h-8 w-48 mb-4" />
            <LoadingSkeleton className="h-64 w-full" />
          </div>
        }>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
