'use client'

import { useTranslations } from 'next-intl';
import SelectShowing from "@/components/dashboard/SelectShowing";
import { Suspense } from "react";
import UserTable from "@/components/dashboard/UserTable";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import deleteUserAction from "@/actions/dashboard/deleteUserAction";
import { AddUserDialog } from "@/components/dashboard/dialogs/AddUserDialog";
import { IUser } from "@/models/User";

interface UsersPageClientProps {
  page: string | string[];
  perPage: string | string[];
  items: IUser[];
  totalItemsLength: number;
}

const UsersPageClient = ({ page, perPage, items, totalItemsLength }: UsersPageClientProps) => {
  const t = useTranslations('admin.users');

  return (
    <Suspense>
      <DashboardContainer className="w-full min-h-svh py-12 px-10 overflow-y-auto">
        <DashboardHeader className="flex justify-between">
          <DashboardTitle>{t('title')}</DashboardTitle>
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

export default UsersPageClient;