import { SearchParams } from "@/types";
import getDevicesAction from "@/actions/dashboard/getDevicesAction";
import { IDevice } from "@/models/Device";
import DevicesPageClient from "@/components/admin/DevicesPageClient";

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
    <DevicesPageClient
      page={page}
      perPage={perPage}
      items={items}
      totalItemsLength={totalItemsLength}
    />
  );
};

export default DevicesPage;
