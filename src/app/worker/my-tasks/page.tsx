import { PageProps } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import LoadingSkeleton from "@/shared/ui/LoadingSkeleton";
import { trackRoutePerformance } from "@/shared/lib/route-optimization";

// Динамические импорты для code splitting
const TaskTable = dynamic(() => import("@/features/dashboard/TaskTable"), {
  loading: () => <LoadingSkeleton className="h-96 w-full" />
});

const DashboardContainer = dynamic(() => import("@/features/dashboard/DashboardContainer"), {
  loading: () => <LoadingSkeleton className="h-screen w-full" />
});

const DashboardHeader = dynamic(() => import("@/features/dashboard/DashboardHeader"), {
  loading: () => <LoadingSkeleton className="h-16 w-full" />
});

const DashboardTitle = dynamic(() => import("@/features/dashboard/DashboardTitle"), {
  loading: () => <LoadingSkeleton className="h-8 w-48" />
});

const SelectShowing = dynamic(() => import("@/features/dashboard/SelectShowing"), {
  loading: () => <LoadingSkeleton className="h-10 w-32" />
});

const DashboardContent = dynamic(() => import("@/features/dashboard/DashboardContent"), {
  loading: () => <LoadingSkeleton className="h-64 w-full" />
});
import { getWorkerTasksAction, WorkerTask } from "@/actions/dashboard/getWorkerTasksAction";
import { ITask } from "@/entities/task/Task";
import mongoose from "mongoose";

// Адаптер для преобразования WorkerTask в ITask
const adaptWorkerTaskToITask = (workerTask: WorkerTask): ITask => ({
  _id: new mongoose.Types.ObjectId(workerTask.id),
  description: workerTask.description,
  workerId: new mongoose.Types.ObjectId(workerTask.assignedTo),
  customerName: workerTask.clientName || 'Не указан',
  customerPhone: 'Не указан',
  status: workerTask.status === 'pending' ? 'Pending' : 
          workerTask.status === 'in_progress' ? 'In Progress' : 'Completed',
  laptopBrand: workerTask.deviceType || 'Не указан',
  laptopModel: 'Не указана',
  totalCost: 0,
  createdAt: workerTask.createdAt,
});

const MyTasksPage = async ({
  searchParams,
}: PageProps) => {
  const startTime = performance.now();
  const resolvedSearchParams = await searchParams;
  const { page = "1", perPage = "5" } = resolvedSearchParams;
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const workerId = user?.id as string;
  const response = await getWorkerTasksAction(workerId);
  const workerTasks = response?.tasks ?? [];
  
  // Преобразуем WorkerTask[] в ITask[]
  const items: ITask[] = workerTasks.map(adaptWorkerTaskToITask);
  const totalItemsLength = items.length;

  return (
    <DashboardContainer className="w-full min-h-svh py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex max-md:flex-col gap-6 justify-between">
        <DashboardTitle>Мои задачи</DashboardTitle>
        <div className="flex gap-6">
          <SelectShowing />
        </div>
      </DashboardHeader>
      <DashboardContent className="bg-background shadow p-6 rounded-lg">
        <TaskTable
          page={parseInt(page, 10)}
          per_page={parseInt(perPage, 10)}
          items={items}
          totalItemsLength={totalItemsLength}
        />
      </DashboardContent>
    </DashboardContainer>
  );
};

// Трекинг производительности после рендера
if (typeof window !== 'undefined') {
  setTimeout(() => {
    trackRoutePerformance('worker-my-tasks', performance.now());
  }, 0);
}

export default MyTasksPage;


