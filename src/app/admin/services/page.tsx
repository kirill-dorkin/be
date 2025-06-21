import { SearchParams } from "@/types";
import SelectShowing from "@/components/dashboard/SelectShowing";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import ServiceTable from "@/components/dashboard/ServiceTable";
import { AddServiceDialog } from "@/components/dashboard/dialogs/AddServiceDialog";
import getServicesAction from "@/actions/dashboard/getServicesAction";
import deleteServiceAction from "@/actions/dashboard/deleteServiceAction";

const ServicesPage = async ({ searchParams }: SearchParams) => {
  const { page = 1, perPage = 5 } = await searchParams;
  const { items, totalItemsLength } = await getServicesAction(
    Number(page),
    Number(perPage),
  );
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
          items={items}
          totalItemsLength={totalItemsLength}
        />
      </DashboardContent>
    </DashboardContainer>
  );
};

export default ServicesPage;
