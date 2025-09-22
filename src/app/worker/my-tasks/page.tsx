import { PageProps } from "@/types";
import authOptions from '@/auth';
import { getServerSession } from 'next-auth';
import { Suspense } from "react";
import LoadingSkeleton from "@/shared/ui/LoadingSkeleton";
import { trackRoutePerformance } from "@/shared/lib/route-optimization";

// Обычные импорты для диагностики
import TaskTable from "@/features/dashboard/TaskTable";
import DashboardContainer from "@/features/dashboard/DashboardContainer";
import DashboardHeader from "@/features/dashboard/DashboardHeader";
import DashboardTitle from "@/features/dashboard/DashboardTitle";
import SelectShowing from "@/features/dashboard/SelectShowing";
import DashboardContent from "@/features/dashboard/DashboardContent";
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


