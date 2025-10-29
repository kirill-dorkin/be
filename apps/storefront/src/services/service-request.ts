import { type ServiceRequestServiceInstance } from "@nimara/infrastructure/service-request/types";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";

import { getStorefrontLogger } from "./lazy-logging";

let loadedService: ServiceRequestServiceInstance | null = null;

export const getServiceRequestService = async (): Promise<ServiceRequestServiceInstance> => {
  if (loadedService) {
    return loadedService;
  }

  const [{ saleorServiceRequestService }, storefrontLogger] = await Promise.all([
    import("@nimara/infrastructure/service-request/providers"),
    getStorefrontLogger(),
  ]);

  loadedService = saleorServiceRequestService({
    apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    appToken: serverEnvs.SALEOR_APP_TOKEN,
    channelSlug: serverEnvs.SERVICE_CHANNEL_SLUG,
    courierGroupName: serverEnvs.SERVICE_COURIER_GROUP_NAME,
    workerGroupName: serverEnvs.SERVICE_WORKER_GROUP_NAME,
    logger: storefrontLogger,
  });

  return loadedService;
};
