// @ts-nocheck
import { SearchParams } from "@/types"
import { AddTaskDialog } from "@/components/dashboard/dialogs/AddTaskDialog";
import SelectShowing from "@/components/dashboard/SelectShowing";
import TaskTable from "@/components/dashboard/TaskTable";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import getTasksAction from "@/actions/dashboard/getTasksAction";
import deleteTaskAction from "@/actions/dashboard/deleteTaskAction";

const TasksPage = async ({
  searchParams,
}: SearchParams) => {
  const { page = "1", perPage = "5" } = await searchParams;
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

export default TasksPage;
