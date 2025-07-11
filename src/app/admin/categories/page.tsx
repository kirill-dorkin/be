import { SearchParams } from "@/types";
import SelectShowing from "@/components/dashboard/SelectShowing";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import CategoryTable from "@/components/dashboard/CategoryTable";
import type { ICategory } from "@/models/Category";
import { AddCategoryDialog } from "@/components/dashboard/dialogs/AddCategoryDialog";
import getCategoriesAction from "@/actions/dashboard/getCategoriesAction";
import deleteCategoryAction from "@/actions/dashboard/deleteCategoryAction";

const CategoriesPage = async ({ searchParams }: SearchParams) => {
  const { page = "1", perPage = "5" } = await searchParams;
  const categoriesResponse = (await getCategoriesAction(
    Number(page),
    Number(perPage),
  )) as any;
  const items: ICategory[] = categoriesResponse.items ?? [];
  const totalItemsLength: number = categoriesResponse.totalItemsLength ?? 0;
  return (
    <DashboardContainer className="w-full min-h-screen py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex justify-between">
        <DashboardTitle>Категории</DashboardTitle>
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

export default CategoriesPage;
