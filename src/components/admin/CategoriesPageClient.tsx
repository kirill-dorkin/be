'use client'

import SelectShowing from "@/components/dashboard/SelectShowing";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import CategoryTable from "@/components/dashboard/CategoryTable";
import type { ICategory } from "@/models/Category";
import { AddCategoryDialog } from "@/components/dashboard/dialogs/AddCategoryDialog";
import deleteCategoryAction from "@/actions/dashboard/deleteCategoryAction";

interface CategoriesPageClientProps {
  page: string | string[];
  perPage: string | string[];
  items: ICategory[];
  totalItemsLength: number;
}

const CategoriesPageClient = ({ page, perPage, items, totalItemsLength }: CategoriesPageClientProps) => {
  return (
    <DashboardContainer className="w-full min-h-screen py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex justify-between">
        <DashboardTitle>Управление категориями</DashboardTitle>
        <div className="flex gap-4">
          <SelectShowing />
          <AddCategoryDialog />
        </div>
      </DashboardHeader>
      <DashboardContent className="bg-background shadow p-6 rounded-lg">
        <CategoryTable
          page={page}
          per_page={perPage}
          deleteAction={deleteCategoryAction}
          items={items as unknown as ICategory[]}
          totalItemsLength={totalItemsLength}
        />
      </DashboardContent>
    </DashboardContainer>
  );
};

export default CategoriesPageClient;