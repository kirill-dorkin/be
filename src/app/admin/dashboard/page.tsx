import { FaTasks, FaHourglassHalf, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import TaskReport from "@/components/dashboard/TaskReport";
import UserList from "@/components/dashboard/UserList";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardGreater from "@/components/dashboard/DashboardGreater";
import AdminProfileHeader from "@/components/dashboard/AdminProfileHeader";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import ListCard from "@/components/dashboard/ListCard";
import { SearchParams } from "@/types";
import getTasksAction from "@/actions/dashboard/getTasksAction";
import getMetricsAction from "@/actions/dashboard/getMetricsAction";
import getWorkersAction from "@/actions/dashboard/getWorkersAction";
import { ITask } from "@/models/Task";
import { IUser } from "@/models/User";

interface TasksResponse {
  items: ITask[];
  totalItemsLength: number;
}

interface WorkersResponse {
  items: IUser[];
}

const DashboardPage = async ({ searchParams }: SearchParams) => {
  const { page = "1", perPage = "5" } = await searchParams;

  const [tasksResponse, metrics, workersResponse] = await Promise.all([
    getTasksAction(Number(page), Number(perPage)),
    getMetricsAction(),
    getWorkersAction(),
  ]);

  const items = (tasksResponse as unknown as TasksResponse).items ?? [];
  const totalItemsLength: number = (tasksResponse as unknown as TasksResponse).totalItemsLength ?? 0;
  const users = (workersResponse as unknown as WorkersResponse).items ?? [];

  const data = [
    {
      label: "Активные задачи",
      value: metrics?.metrics?.totalActiveTasks ?? 0,
      icon: <FaTasks />,
    },
    {
      label: "Задачи в ожидании",
      value: metrics?.metrics?.totalPendingTasks ?? 0,
      icon: <FaExclamationCircle />,
    },
    {
      label: "Задачи в процессе",
      value: metrics?.metrics?.totalInProgressTasks ?? 0,
      icon: <FaHourglassHalf />,
    },
    {
      label: "Завершенные задачи",
      value: metrics?.metrics?.totalCompletedTasks ?? 0,
      icon: <FaCheckCircle />,
    },
  ];

  return (
    <DashboardContainer className="w-full min-h-svh py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex justify-between">
        <DashboardGreater />
        <AdminProfileHeader />
      </DashboardHeader>
      <DashboardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
        <DashboardSummary
          data={data} />
        <section className="flex flex-col gap-6 col-span-1 sm:col-span-2 lg:col-span-5">
          <TaskReport
            page={page}
            per_page={perPage}
            items={items}
            totalItemsLength={totalItemsLength}
          />
        </section>
        <section className="flex flex-col col-span-1 sm:col-span-2 lg:col-span-2 gap-6">
          <ListCard
            title="Список сотрудников"
            description="Подробный список всех сотрудников Best Electronics с основной информацией."
          >
            <UserList users={users} />
          </ListCard>
        </section>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default DashboardPage;
