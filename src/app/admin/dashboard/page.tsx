import { Suspense } from "react";
// Временно используем обычные импорты для диагностики
import DashboardContainer from "@/features/dashboard/DashboardContainer";
import DashboardContent from "@/features/dashboard/DashboardContent";
import DashboardGreater from "@/features/dashboard/DashboardGreater";
import DashboardHeader from "@/features/dashboard/DashboardHeader";
import DashboardSummary from "@/features/dashboard/DashboardSummary";
import AdminProfileHeader from "@/features/dashboard/AdminProfileHeader";
import { getTasksAction } from "@/shared/api/dashboard/getTasksAction";
import { getMetricsAction } from "@/shared/api/dashboard/getMetricsAction";
import { getWorkersAction } from "@/shared/api/dashboard/getWorkersAction";
import LoadingSkeleton from "@/shared/ui/LoadingSkeleton";
import { trackRoutePerformance } from "@/shared/lib/route-optimization";
// Временно отключаем lazy компоненты
import TaskReport from "@/features/dashboard/TaskReport";
import ListCard from "@/features/dashboard/ListCard";
import { Icons } from '@/shared/ui/icons';
import DashboardPageWrapper from './DashboardPageWrapper';

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

  const [tasksResponse, metricsResponse, workersResponse] = await Promise.all([
    getTasksAction(parseInt(page, 10), parseInt(perPage, 10)),
    getMetricsAction(),
    getWorkersAction(),
  ]);

  const items = (tasksResponse as any).items ?? [];
  const totalItemsLength: number = (tasksResponse as any).totalItemsLength ?? 0;
  const users = (workersResponse as any).items ?? [];
  const metrics = (metricsResponse as any).metrics;

  const data = [
    {
      label: "Активные задачи",
      value: metrics?.inProgressTasks ?? 0,
      icon: <Icons.tasks />,
    },
    {
      label: "Задачи в ожидании",
      value: metrics?.totalPendingTasks ?? 0,
      icon: <Icons.warning />,
    },
    {
      label: "Задачи в процессе",
      value: metrics?.totalInProgressTasks ?? 0,
      icon: <Icons.clock />,
    },
    {
      label: "Завершенные задачи",
      value: metrics?.totalCompletedTasks ?? 0,
      icon: <Icons.check />,
    },
  ];

  return (
    <DashboardPageWrapper>
      <DashboardContainer className="w-full min-h-svh py-12 px-10 overflow-y-auto">
        <DashboardHeader className="flex justify-between">
          <DashboardGreater />
          <AdminProfileHeader />
        </DashboardHeader>
        <DashboardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
          <DashboardSummary data={data} />
          <div className="lg:col-span-4">
            <Suspense fallback={<LoadingSkeleton />}>
              <TaskReport
                items={items}
                totalItemsLength={totalItemsLength}
                page={parseInt(page, 10)}
                per_page={parseInt(perPage, 10)}
              />
            </Suspense>
          </div>
          <div className="lg:col-span-3">
            <Suspense fallback={<LoadingSkeleton />}>
              <ListCard
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
              </ListCard>
            </Suspense>
          </div>
        </DashboardContent>
      </DashboardContainer>
    </DashboardPageWrapper>
  );
};

// Трекинг производительности после рендера
if (typeof window !== 'undefined') {
  setTimeout(() => {
    trackRoutePerformance('admin-dashboard', performance.now());
  }, 0);
}

export default DashboardPage;
