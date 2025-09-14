import { Metadata } from 'next';
import getTasksAction from "@/actions/dashboard/getTasksAction";
import { ITask } from "@/models/Task";
import TasksPageClient from '@/components/admin/TasksPageClient';

interface TasksResponse {
  items: ITask[];
  totalItemsLength: number;
}

export const metadata: Metadata = {
  title: 'Управление задачами - Админ панель',
  description: 'Управление и отслеживание задач в системе'
};

const TasksPage = async ({
  searchParams,
}: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const { page = "1", perPage = "5" } = await searchParams;

  const tasksResponse = (await getTasksAction(
    Number(page),
    Number(perPage),
  )) as unknown as TasksResponse;
  const items = tasksResponse.items ?? [];
  const totalItemsLength: number = tasksResponse.totalItemsLength ?? 0;

  return (
    <TasksPageClient
      page={page}
      perPage={perPage}
      items={items}
      totalItemsLength={totalItemsLength}
    />
  );
};

export default TasksPage;