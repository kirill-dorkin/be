import { SearchParams } from "@/types";
import getTasksAction from "@/actions/dashboard/getTasksAction";
import getMetricsAction from "@/actions/dashboard/getMetricsAction";
import getWorkersAction from "@/actions/dashboard/getWorkersAction";
import { ITask } from "@/models/Task";
import { IUser } from "@/models/User";
import DashboardPageClient from "@/components/admin/DashboardPageClient";

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

  return (
    <DashboardPageClient
      page={page}
      perPage={perPage}
      items={items}
      totalItemsLength={totalItemsLength}
      users={users}
      metrics={metrics}
    />
  );
};

export default DashboardPage;
