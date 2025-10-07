"use server";

import { revalidatePath } from "next/cache";

import { err } from "@nimara/domain/objects/Result";

import { paths } from "@/lib/paths";
import {
  getPaymentService,
  isPaymentServiceConfigured,
} from "@/services/payment";

const paymentProviderUnavailable = () =>
  err([
    {
      code: "NOT_AVAILABLE_ERROR",
      message: "Stripe payment integration is not configured.",
    },
  ]);

export const paymentMethodDeleteAction = async ({
  customerId,
  paymentMethodId,
}: {
  customerId: string;
  paymentMethodId: string;
}) => {
  if (!isPaymentServiceConfigured) {
    return paymentProviderUnavailable();
  }

  const paymentService = await getPaymentService();
  const result = await paymentService.customerPaymentMethodDelete({
    customerId,
    paymentMethodId,
  });

  if (result.ok) {
    revalidatePath(paths.account.paymentMethods.asPath());
  }

  return result;
};

export const generateSecretAction = async ({
  customerId,
}: {
  customerId: string;
}) => {
  if (!isPaymentServiceConfigured) {
    return paymentProviderUnavailable();
  }

  const paymentService = await getPaymentService();

  return paymentService.paymentMethodSaveInitialize({
    customerId,
  });
};
