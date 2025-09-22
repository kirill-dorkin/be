import { PageProps } from "@/types";
import ServiceTable from "@/features/dashboard/ServiceTable";
import DashboardContainer from "@/features/dashboard/DashboardContainer";
import DashboardHeader from "@/features/dashboard/DashboardHeader";
import DashboardTitle from "@/features/dashboard/DashboardTitle";
import SelectShowing from "@/features/dashboard/SelectShowing";
import DashboardContent from "@/features/dashboard/DashboardContent";
import { AddServiceDialog } from "@/features/dashboard/dialogs/AddServiceDialog";
import { getServicesAction } from "@/actions/dashboard/getServicesAction";
import { deleteServiceAction } from "@/actions/dashboard/deleteServiceAction";

const ServicesPage = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = await searchParams;
  const { page = "1", perPage = "5" } = resolvedSearchParams;
  const servicesResponse = (await getServicesAction(
    Number(page),
    Number(perPage),
  )) as any;
  const items = servicesResponse.items ?? [];
  const totalItemsLength: number = servicesResponse.totalItemsLength ?? 0;
  return (
    <DashboardContainer className="w-full min-h-screen py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex justify-between">
        <DashboardTitle>Услуги</DashboardTitle>
        <div className="flex gap-4">
          <SelectShowing />
          <AddServiceDialog />
        </div>
      </DashboardHeader>
      <DashboardContent className="bg-background shadow p-6 rounded-lg">
        <ServiceTable
          page={page}
          per_page={perPage}
          deleteAction={deleteServiceAction}
          items={items as any}
          totalItemsLength={totalItemsLength}
        />
      </DashboardContent>
    </DashboardContainer>
  );
};

export default ServicesPage;
