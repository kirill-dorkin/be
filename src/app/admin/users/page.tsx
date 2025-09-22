import SelectShowing from "@/features/dashboard/SelectShowing";
import { Suspense } from "react";
import UserTable from "@/features/dashboard/UserTable";
import DashboardContainer from "@/features/dashboard/DashboardContainer";
import DashboardHeader from "@/features/dashboard/DashboardHeader";
import DashboardContent from "@/features/dashboard/DashboardContent";
import DashboardTitle from "@/features/dashboard/DashboardTitle";
import { getUsersAction } from "@/shared/api/dashboard/getUsersAction"
import { deleteUserAction } from "@/shared/api/dashboard/deleteUserAction"
import { PageProps } from "@/types";

import { AddUserDialog } from "@/features/dashboard/dialogs/AddUserDialog";
import { IUser } from "@/entities/user/User";

const UsersPage = async ({
  searchParams,
}: PageProps) => {
  const resolvedSearchParams = await searchParams;
  const { page = "1", perPage = "5" } = resolvedSearchParams;

  const usersResponse = await getUsersAction(parseInt(page, 10), parseInt(perPage, 10));
  
  // Проверяем успешность ответа и извлекаем данные
  const items: IUser[] = usersResponse.status === "success" && "items" in usersResponse && usersResponse.items 
    ? (usersResponse.items as unknown as IUser[])
    : [];
  const totalItemsLength: number = usersResponse.status === "success" && "totalItemsLength" in usersResponse && usersResponse.totalItemsLength 
    ? usersResponse.totalItemsLength
    : 0;

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
            page={parseInt(page, 10)}
            per_page={parseInt(perPage, 10)}
            items={items}
            totalItemsLength={totalItemsLength}
          />
        </DashboardContent>
      </DashboardContainer>
    </Suspense>
  );
};

export default UsersPage;
