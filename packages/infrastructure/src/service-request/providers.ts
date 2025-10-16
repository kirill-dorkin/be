import { saleorServiceRequestCreateInfra } from "./saleor/infrastructure/create-service-request-infra";
import type {
  SaleorServiceRequestConfig,
  ServiceRequestService,
} from "./types";

export const saleorServiceRequestService: ServiceRequestService<
  SaleorServiceRequestConfig
> = (config) => ({
  create: saleorServiceRequestCreateInfra(config),
});
