import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getTasksAction } from "@/actions/dashboard/getTasksAction";
import { getMetricsAction } from "@/actions/dashboard/getMetricsAction";
import { getWorkersAction } from "@/actions/dashboard/getWorkersAction";
import LoadingSkeleton from "@/shared/ui/LoadingSkeleton";
import { trackRoutePerformance } from "@/shared/lib/route-optimization";

// Динамические импорты для code splitting
const DashboardContainer = dynamic(() => import("@/features/dashboard/DashboardContainer"), {
  loading: () => <LoadingSkeleton className="h-screen w-full" />
});

const DashboardContent = dynamic(() => import("@/features/dashboard/DashboardContent"), {
  loading: () => <LoadingSkeleton className="h-96 w-full" />
});

const DashboardGreater = dynamic(() => import("@/features/dashboard/DashboardGreater"), {
  loading: () => <LoadingSkeleton className="h-32 w-full" />
});

const DashboardHeader = dynamic(() => import("@/features/dashboard/DashboardHeader"), {
  loading: () => <LoadingSkeleton className="h-16 w-full" />
});

const DashboardSummary = dynamic(() => import("@/features/dashboard/DashboardSummary"), {
  loading: () => <LoadingSkeleton className="h-48 w-full" />
});

const AdminProfileHeader = dynamic(() => import("@/features/dashboard/AdminProfileHeader"), {
  loading: () => <LoadingSkeleton className="h-20 w-full" />
});

// Динамические импорты для lazy компонентов
const LazyTaskReport = dynamic(() => import("@/features/dashboard/components/LazyComponents").then(mod => ({ default: mod.LazyTaskReport })), {
  loading: () => <LoadingSkeleton className="h-64 w-full" />
});

const LazyListCard = dynamic(() => import("@/features/dashboard/components/LazyComponents").then(mod => ({ default: mod.LazyListCard })), {
  loading: () => <LoadingSkeleton className="h-48 w-full" />
});
import { Icons } from '@/shared/ui/icons';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    perPage?: string;
  }>;
}

const DashboardPage = async ({ searchParams }: PageProps) => {
  const startTime = performance.now();
  const resolvedSearchParams = await searchParams;
  const { page = "1", perPage = "5" } = resolvedSearchParams;

  const [tasksResponse, metrics, workersResponse] = await Promise.all([
    getTasksAction(parseInt(page, 10), parseInt(perPage, 10)),
    getMetricsAction(),
    getWorkersAction(),
  ]);

  const items = (tasksResponse as any).items ?? [];
  const totalItemsLength: number = (tasksResponse as any).totalItemsLength ?? 0;
  const users = (workersResponse as any).items ?? [];

  const data = [
    {
      label: "Активные задачи",
      value: metrics?.inProgressTasks ?? 0,
      icon: <Icons.tasks />,
    },
    {
      label: "Задачи в ожидании",
      value: metrics?.pendingTasks ?? 0,
      icon: <Icons.warning />,
    },
    {
      label: "Задачи в процессе",
      value: metrics?.inProgressTasks ?? 0,
      icon: <Icons.clock />,
    },
    {
      label: "Завершенные задачи",
      value: metrics?.completedTasks ?? 0,
      icon: <Icons.check />,
    },
  ];

  return (
    <DashboardContainer className="w-full min-h-svh py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex justify-between">
        <DashboardGreater />
        <AdminProfileHeader />
      </DashboardHeader>
      <DashboardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
        <DashboardSummary data={data} />
        <div className="lg:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <LazyTaskReport
              items={items}
              totalItemsLength={totalItemsLength}
              page={parseInt(page, 10)}
              per_page={parseInt(perPage, 10)}
            />
          </Suspense>
        </div>
        <div className="lg:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <LazyListCard
              title="Сотрудники"
              description="Список активных сотрудников"
            >
              <div className="space-y-2">
                {users.map((user: any) => (
                  <div key={user._id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.tasks?.length || 0} задач
                    </div>
                  </div>
                ))}
              </div>
            </LazyListCard>
          </Suspense>
        </div>
      </DashboardContent>
    </DashboardContainer>
  );
};

// Трекинг производительности после рендера
if (typeof window !== 'undefined') {
  setTimeout(() => {
    trackRoutePerformance('admin-dashboard', performance.now());
  }, 0);
}

export default DashboardPage;
