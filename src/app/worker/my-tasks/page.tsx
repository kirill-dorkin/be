import { SearchParams } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import SelectShowing from "@/components/dashboard/SelectShowing";
import TaskTable from "@/components/dashboard/TaskTable";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import getWorkerTasksAction from "@/actions/dashboard/getWorkerTasksAction";

const MyTasksPage = async ({
  searchParams,
}: SearchParams) => {
  const { page = 1, perPage = 5 } = await searchParams;
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const workerId = user?.id as string;
  // @ts-ignore
  const { items = [], totalItemsLength = 0 } = await getWorkerTasksAction(
    workerId,
    Number(page),
    Number(perPage),
  );

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
          // @ts-ignore
          page={page}
          // @ts-ignore
          per_page={perPage}
          // @ts-ignore
          items={items}
          totalItemsLength={totalItemsLength}
        />
      </DashboardContent>
    </DashboardContainer>
  );
};

export default MyTasksPage;


