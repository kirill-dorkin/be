import { PageProps } from "@/types";
import SelectShowing from "@/features/dashboard/SelectShowing";
import DashboardContainer from "@/features/dashboard/DashboardContainer";
import DashboardHeader from "@/features/dashboard/DashboardHeader";
import DashboardContent from "@/features/dashboard/DashboardContent";
import DashboardTitle from "@/features/dashboard/DashboardTitle";
import CategoryTable from "@/features/dashboard/CategoryTable";
import type { ICategory } from "@/entities/category/Category";
import type { Category } from "@/shared/types";
import { AddCategoryDialog } from "@/features/dashboard/dialogs/AddCategoryDialog";
import { getCategoriesAction } from "@/shared/api/dashboard/getCategoriesAction";
import { deleteCategoryAction } from "@/shared/api/dashboard/deleteCategoryAction";

const CategoriesPage = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = await searchParams;
  const { page = "1", perPage = "5" } = resolvedSearchParams;
  const categoriesResponse = (await getCategoriesAction(
    Number(page),
    Number(perPage),
  )) as any;
  const items: ICategory[] = categoriesResponse.items ?? [];
  const totalItemsLength: number = categoriesResponse.totalItemsLength ?? 0;
  
  // Приводим ICategory[] к Category[]
  const categoriesForTable: Category[] = items.map(cat => ({
    _id: cat._id?.toString(),
    name: cat.name
  }));

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
          items={categoriesForTable}
          totalItemsLength={totalItemsLength}
        />
      </DashboardContent>
    </DashboardContainer>
  );
};

export default CategoriesPage;
