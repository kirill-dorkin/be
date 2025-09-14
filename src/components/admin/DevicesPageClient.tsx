'use client'

import SelectShowing from "@/components/dashboard/SelectShowing";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import DeviceTable from "@/components/dashboard/DeviceTable";
import { AddDeviceDialog } from "@/components/dashboard/dialogs/AddDeviceDialog";
import deleteDeviceAction from "@/actions/dashboard/deleteDeviceAction";
import { IDevice } from "@/models/Device";

interface DevicesPageClientProps {
  page: string | string[];
  perPage: string | string[];
  items: IDevice[];
  totalItemsLength: number;
}

const DevicesPageClient = ({ page, perPage, items, totalItemsLength }: DevicesPageClientProps) => {
  return (
    <DashboardContainer className="w-full min-h-screen py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex justify-between">
        <DashboardTitle>Управление устройствами</DashboardTitle>
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

export default DevicesPageClient;