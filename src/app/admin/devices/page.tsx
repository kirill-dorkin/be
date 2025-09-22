import { PageProps } from "@/types";
import DeviceTable from "@/features/dashboard/DeviceTable";
import DashboardContainer from "@/features/dashboard/DashboardContainer";
import DashboardHeader from "@/features/dashboard/DashboardHeader";
import DashboardTitle from "@/features/dashboard/DashboardTitle";
import SelectShowing from "@/features/dashboard/SelectShowing";
import DashboardContent from "@/features/dashboard/DashboardContent";
import { AddDeviceDialog } from "@/features/dashboard/dialogs/AddDeviceDialog";

import { getDevicesAction } from "@/shared/api/dashboard/getDevicesAction";
import { deleteDeviceAction } from "@/shared/api/dashboard/deleteDeviceAction";

const DevicesPage = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = await searchParams;
  const { page = "1", perPage = "5" } = resolvedSearchParams;
  const devicesResponse = (await getDevicesAction(
    Number(page),
    Number(perPage),
  )) as any;
  const items = devicesResponse.items ?? [];
  const totalItemsLength: number = devicesResponse.totalItemsLength ?? 0;
  return (
    <DashboardContainer className="w-full min-h-screen py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex justify-between">
        <DashboardTitle>Устройства</DashboardTitle>
        <div className="flex gap-4">
          <SelectShowing />
          <AddDeviceDialog />
        </div>
      </DashboardHeader>
      <DashboardContent className="bg-background shadow p-6 rounded-lg">
        <DeviceTable
          page={page}
          per_page={perPage}
          deleteAction={deleteDeviceAction}
          items={items as any}
          totalItemsLength={totalItemsLength}
        />
      </DashboardContent>
    </DashboardContainer>
  );
};

export default DevicesPage;
