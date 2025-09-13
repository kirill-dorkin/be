import { SearchParams } from "@/types";
import getServicesAction from "@/actions/dashboard/getServicesAction";
import { IService } from "@/models/Service";
import ServicesPageClient from "@/components/admin/ServicesPageClient";

interface ServicesResponse {
  items: IService[];
  totalItemsLength: number;
}

const ServicesPage = async ({ searchParams }: SearchParams) => {
  const { page = "1", perPage = "5" } = await searchParams;
  const servicesResponse = (await getServicesAction(
    Number(page),
    Number(perPage),
  )) as unknown as ServicesResponse;
  const items = servicesResponse.items ?? [];
  const totalItemsLength: number = servicesResponse.totalItemsLength ?? 0;
  return (
    <ServicesPageClient
      page={page}
      perPage={perPage}
      items={items}
      totalItemsLength={totalItemsLength}
    />
  );
};

export default ServicesPage;
