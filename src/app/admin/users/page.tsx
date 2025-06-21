import SelectShowing from "@/components/dashboard/SelectShowing";
import { Suspense, } from "react";
import UserTable from "@/components/dashboard/UserTable";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import getUsersAction from "@/actions/dashboard/getUsersAction"
import { SearchParams } from "@/types"
import deleteUserAction from "@/actions/dashboard/deleteUserAction";

const UsersPage = async ({
  searchParams,
}: SearchParams) => {
  const { page = 1, perPage = 5 } = await searchParams;

  // @ts-ignore
  const { items, totalItemsLength } = await getUsersAction(
    Number(page),
    Number(perPage),
  );

  return (
    <Suspense>
      <DashboardContainer className="w-full min-h-svh py-12 px-10 overflow-y-auto">
        <DashboardHeader className="flex justify-between">
          <DashboardTitle>Users</DashboardTitle>
          <div className="flex gap-6">
            <SelectShowing />
          </div>
        </DashboardHeader>
        <DashboardContent className="bg-background shadow p-6 rounded-lg">
          <UserTable
            // @ts-ignore
            page={page}
            deleteAction={deleteUserAction}
            // @ts-ignore
            per_page={perPage}
            items={items}
            totalItemsLength={totalItemsLength}
          />
        </DashboardContent>
      </DashboardContainer>
    </Suspense>
  );
};

export default UsersPage;
