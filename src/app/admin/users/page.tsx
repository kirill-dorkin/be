import SelectShowing from "@/components/dashboard/SelectShowing";
import { Suspense } from "react";
import UserTable from "@/components/dashboard/UserTable";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import getUsersAction from "@/actions/dashboard/getUsersAction"
import deleteUserAction from "@/actions/dashboard/deleteUserAction"
import { SearchParams } from "@/types"

import { AddUserDialog } from "@/components/dashboard/dialogs/AddUserDialog";
import { IUser } from "@/models/User";

const UsersPage = async ({
  searchParams,
}: SearchParams) => {
  const { page = "1", perPage = "5" } = await searchParams;

  const usersResponse = await getUsersAction(
    Number(page),
    Number(perPage),
  );
  const items: IUser[] = (usersResponse as unknown as { items: IUser[]; totalItemsLength: number }).items ?? [];
  const totalItemsLength: number = (usersResponse as unknown as { items: IUser[]; totalItemsLength: number }).totalItemsLength ?? 0;

  return (
    <Suspense>
      <DashboardContainer className="w-full min-h-svh py-12 px-10 overflow-y-auto">
        <DashboardHeader className="flex justify-between">
          <DashboardTitle>Пользователи</DashboardTitle>
          <div className="flex gap-6">
            <SelectShowing />
            <AddUserDialog />
          </div>
        </DashboardHeader>
        <DashboardContent className="bg-background shadow p-6 rounded-lg">
          <UserTable
            page={page}
            deleteAction={deleteUserAction}
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
