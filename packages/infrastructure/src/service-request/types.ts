import { type AsyncResult } from "@nimara/domain/objects/Result";

import { type Logger } from "#root/logging/types";

export type ServiceRequestContactPreferences = "phone" | "email";

export type ServiceRequestPriceEstimate = {
  currency: string;
  max: number | null;
  min: number | null;
};

export type ServiceRequestSubmission = {
  consent: boolean;
  deviceType: string;
  email?: string;
  fullName: string;
  message?: string;
  modifiers: Record<string, number>;
  needsPickup: boolean;
  phone: string;
  preferredContact?: ServiceRequestContactPreferences;
  priceEstimate?: ServiceRequestPriceEstimate;
  serviceSlug: string;
  urgent: boolean;
};

export type RepairServiceSummary = {
  category: string;
  group: string;
  name: string;
  slug: string;
};

export type ServiceWorker = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
};

export type ServiceRequestCreateSuccess = {
  assignedWorker?: ServiceWorker;
  orderId: string;
  orderNumber?: string | null;
};

export type ServiceRequestCreateInput = {
  createdAt: string;
  request: ServiceRequestSubmission;
  service: RepairServiceSummary;
};

export type ServiceRequestCreateInfra = (
  input: ServiceRequestCreateInput,
) => AsyncResult<ServiceRequestCreateSuccess>;

export type ServiceRequestServiceInstance = {
  create: ServiceRequestCreateInfra;
};

export type ServiceRequestService<Config> = (
  config: Config,
) => ServiceRequestServiceInstance;

export type SaleorServiceRequestConfig = {
  apiURL: string;
  appToken: string;
  channelSlug: string;
  logger: Logger;
  workerGroupName: string;
};
