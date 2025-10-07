import { type StripePaymentService } from "@nimara/infrastructure/payment/providers";

import { clientEnvs, isStripeClientConfigured } from "@/envs/client";
import { isStripeServerConfigured, serverEnvs } from "@/envs/server";

import { getStorefrontLogger } from "./lazy-logging";

let loadedService: StripePaymentService | null = null;

export class PaymentServiceUnavailableError extends Error {
  constructor() {
    super("Stripe payment integration is not configured.");
    this.name = "PaymentServiceUnavailableError";
  }
}

export const isPaymentServiceConfigured =
  isStripeClientConfigured && isStripeServerConfigured;

/**
 * Loads the Saleor StripePaymentService instance.
 * @returns A promise that resolves to the CheckoutService instance.
 */
export const getPaymentService = async (): Promise<StripePaymentService> => {
  if (loadedService) {
    return loadedService;
  }

  if (!isPaymentServiceConfigured) {
    throw new PaymentServiceUnavailableError();
  }

  const [{ stripePaymentService }, storefrontLogger] = await Promise.all([
    import("@nimara/infrastructure/payment/providers"),
    getStorefrontLogger(),
  ]);

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
