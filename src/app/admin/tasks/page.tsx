// @ts-nocheck
import { PageProps } from "@/types";
import { Suspense } from "react";
import LoadingSkeleton from "@/shared/ui/LoadingSkeleton";
import { trackRoutePerformance } from "@/shared/lib/route-optimization";

// Обычные импорты для диагностики
import { AddTaskDialog } from "@/features/dashboard/dialogs/AddTaskDialog";
import SelectShowing from "@/features/dashboard/SelectShowing";
import TaskTable from "@/features/dashboard/TaskTable";
import DashboardContainer from "@/features/dashboard/DashboardContainer";
import DashboardHeader from "@/features/dashboard/DashboardHeader";
import DashboardContent from "@/features/dashboard/DashboardContent";
import DashboardTitle from "@/features/dashboard/DashboardTitle";
import { getTasksAction } from "@/shared/api/dashboard/getTasksAction";
import { deleteTaskAction } from "@/shared/api/dashboard/deleteTaskAction";

const TasksPage = async ({
  searchParams,
}: PageProps) => {
  const startTime = performance.now();
  const resolvedSearchParams = await searchParams;
  const { page = "1", perPage = "5" } = resolvedSearchParams;
  const tasksResponse = (await getTasksAction(
    Number(page),
    Number(perPage),
  )) as any;
  const items = tasksResponse.items ?? [];
  const totalItemsLength: number = tasksResponse.totalItemsLength ?? 0;

  return (
    <DashboardContainer className="w-full min-h-screen py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-12">
        <DashboardTitle>Задачи</DashboardTitle>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
          <SelectShowing />
          <AddTaskDialog />
        </div>
      </DashboardHeader>
      <DashboardContent className="bg-background shadow p-6 rounded-lg">
        <Suspense fallback={<LoadingSkeleton />}>
          <TaskTable
            page={page}
            deleteAction={deleteTaskAction}
            per_page={perPage}
            items={items as any}
            totalItemsLength={totalItemsLength}
          />
        </Suspense>
      </DashboardContent>
    </DashboardContainer>
  );
};

// Трекинг производительности после рендера
if (typeof window !== 'undefined') {
  setTimeout(() => {
    trackRoutePerformance('admin-tasks', performance.now());
  }, 0);
}

export default TasksPage;
