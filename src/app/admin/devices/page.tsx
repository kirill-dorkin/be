import { SearchParams } from "@/types";
import SelectShowing from "@/components/dashboard/SelectShowing";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import DeviceTable from "@/components/dashboard/DeviceTable";
import { AddDeviceDialog } from "@/components/dashboard/dialogs/AddDeviceDialog";
import getDevicesAction from "@/actions/dashboard/getDevicesAction";
import deleteDeviceAction from "@/actions/dashboard/deleteDeviceAction";
import { IDevice } from "@/models/Device";

interface DevicesResponse {
  items: IDevice[];
  totalItemsLength: number;
}

const DevicesPage = async ({ searchParams }: SearchParams) => {
  const { page = "1", perPage = "5" } = await searchParams;
  const devicesResponse = (await getDevicesAction(
    Number(page),
    Number(perPage),
  )) as unknown as DevicesResponse;
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
          items={items}
          totalItemsLength={totalItemsLength}
        />
      </DashboardContent>
    </DashboardContainer>
  );
};

export default DevicesPage;
