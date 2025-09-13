import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from "@/types"
import getTasksAction from "@/actions/dashboard/getTasksAction";
import { ITask } from "@/models/Task";
import TasksPageClient from "@/components/admin/TasksPageClient";

interface TasksResponse {
  items: ITask[];
  totalItemsLength: number;
}

type Props = {
  params: { locale: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin.tasks' });
  
  return {
    title: t('metadata.title'),
    description: t('metadata.description')
  };
}

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
