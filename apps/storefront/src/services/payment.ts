import { err } from "@nimara/domain/objects/Result";
import { type Logger } from "@nimara/infrastructure/logging/types";
import { type StripePaymentService } from "@nimara/infrastructure/payment/providers";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";

import { getStorefrontLogger } from "./lazy-logging";

let loadedService: StripePaymentService | null = null;

const DISABLED_MESSAGE =
  "Stripe payment service is disabled because the required configuration is missing.";

const missingPaymentConfigEntries: Array<[string, string | undefined]> = [
  ["NEXT_PUBLIC_PAYMENT_APP_ID", clientEnvs.PAYMENT_APP_ID],
  ["NEXT_PUBLIC_STRIPE_PUBLIC_KEY", clientEnvs.STRIPE_PUBLIC_KEY],
];

if (typeof window === "undefined") {
  missingPaymentConfigEntries.push([
    "STRIPE_SECRET_KEY",
    serverEnvs.STRIPE_SECRET_KEY,
  ]);
}

const missingPaymentConfigKeys = missingPaymentConfigEntries
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isPaymentServiceConfigured = missingPaymentConfigKeys.length === 0;

const createDisabledResult = () =>
  err([
    {
      code: "PAYMENT_SERVICE_DISABLED_ERROR",
      message: DISABLED_MESSAGE,
    },
  ]);

const createDisabledPaymentService = (logger: Logger): StripePaymentService => {
  const warn = (operation: string) =>
    logger.warning(DISABLED_MESSAGE, {
      operation,
      missingKeys: missingPaymentConfigKeys,
    });

  return {
    paymentGatewayInitialize: async (_opts) => {
      warn("paymentGatewayInitialize");

      return createDisabledResult();
    },
    paymentGatewayTransactionInitialize: async (_opts) => {
      warn("paymentGatewayTransactionInitialize");

      return createDisabledResult();
    },
    paymentInitialize: async () => {
      warn("paymentInitialize");
    },
    paymentElementCreate: async (_opts) => {
      warn("paymentElementCreate");

      return {
        mount: () => {
          throw new Error(DISABLED_MESSAGE);
        },
        unmount: () => undefined,
      };
    },
    paymentExecute: async (_opts) => {
      warn("paymentExecute");

      return createDisabledResult();
    },
    paymentResultProcess: async (_opts) => {
      warn("paymentResultProcess");

      return createDisabledResult();
    },
    paymentMethodSaveInitialize: async (_opts) => {
      warn("paymentMethodSaveInitialize");

      return createDisabledResult();
    },
    paymentMethodSaveExecute: async (_opts) => {
      warn("paymentMethodSaveExecute");

      return createDisabledResult();
    },
    paymentMethodSaveProcess: async (_opts) => {
      warn("paymentMethodSaveProcess");

      return createDisabledResult();
    },
    customerGet: async (_opts) => {
      warn("customerGet");

      return createDisabledResult();
    },
    customerPaymentMethodsList: async (_opts) => {
      warn("customerPaymentMethodsList");

      return createDisabledResult();
    },
    customerPaymentMethodDelete: async (_opts) => {
      warn("customerPaymentMethodDelete");

      return createDisabledResult();
    },
  } satisfies StripePaymentService;
};

/**
 * Loads the Saleor StripePaymentService instance.
 * @returns A promise that resolves to the CheckoutService instance.
 */
export const getPaymentService = async (): Promise<StripePaymentService> => {
  if (loadedService) {
    return loadedService;
  }

  const storefrontLogger = await getStorefrontLogger();

  if (!isPaymentServiceConfigured) {
    storefrontLogger.warning(DISABLED_MESSAGE, {
      missingKeys: missingPaymentConfigKeys,
    });

    loadedService = createDisabledPaymentService(storefrontLogger);

    return loadedService;
  }

  const { stripePaymentService } = await import(
    "@nimara/infrastructure/payment/providers"
  );

  loadedService = stripePaymentService({
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    secretKey: serverEnvs.STRIPE_SECRET_KEY!,
    publicKey: clientEnvs.STRIPE_PUBLIC_KEY!,
    environment: clientEnvs.ENVIRONMENT,
    gatewayAppId: clientEnvs.PAYMENT_APP_ID!,
    logger: storefrontLogger,
  });

  return loadedService;
};
