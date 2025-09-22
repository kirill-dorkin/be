// @ts-nocheck
import { PageProps } from "@/types";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import LoadingSkeleton from "@/shared/ui/LoadingSkeleton";
import { trackRoutePerformance } from "@/shared/lib/route-optimization";

// Динамические импорты для code splitting
const AddTaskDialog = dynamic(() => import("@/features/dashboard/dialogs/AddTaskDialog").then(mod => ({ default: mod.AddTaskDialog })), {
  loading: () => <LoadingSkeleton className="h-10 w-32" />
});

const SelectShowing = dynamic(() => import("@/features/dashboard/SelectShowing"), {
  loading: () => <LoadingSkeleton className="h-10 w-32" />
});

const TaskTable = dynamic(() => import("@/features/dashboard/TaskTable"), {
  loading: () => <LoadingSkeleton className="h-96 w-full" />
});

const DashboardContainer = dynamic(() => import("@/features/dashboard/DashboardContainer"), {
  loading: () => <LoadingSkeleton className="h-screen w-full" />
});

const DashboardHeader = dynamic(() => import("@/features/dashboard/DashboardHeader"), {
  loading: () => <LoadingSkeleton className="h-16 w-full" />
});

const DashboardContent = dynamic(() => import("@/features/dashboard/DashboardContent"), {
  loading: () => <LoadingSkeleton className="h-64 w-full" />
});

const DashboardTitle = dynamic(() => import("@/features/dashboard/DashboardTitle"), {
  loading: () => <LoadingSkeleton className="h-8 w-48" />
});
import { getTasksAction } from "@/actions/dashboard/getTasksAction";
import { deleteTaskAction } from "@/actions/dashboard/deleteTaskAction";

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
        <TaskTable
          page={page}
          deleteAction={deleteTaskAction}
          per_page={perPage}
          items={items as any}
          totalItemsLength={totalItemsLength}
        />
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
