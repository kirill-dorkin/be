import { z } from "zod";

import { SUPPORTED_CHANNELS } from "@/regions/types";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const resolveDefaultStorefrontUrl = () => {
  const explicitUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL?.trim();

  if (explicitUrl) {
    return explicitUrl;
  }

  const vercelProductionHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ??
    process.env.VERCEL_URL?.trim();
  const vercelBranchHost = process.env.VERCEL_BRANCH_URL?.trim();
  const fallbackHost =
    vercelProductionHost ?? vercelBranchHost ?? "localhost:3000";

  if (
    fallbackHost.startsWith("http://") ||
    fallbackHost.startsWith("https://")
  ) {
    return fallbackHost;
  }

  const protocol =
    fallbackHost.includes("localhost") || fallbackHost.startsWith("127.")
      ? "http"
      : "https";

  return `${protocol}://${fallbackHost}`;
};

const schema = z.object({
  NEXT_PUBLIC_CMS_SERVICE: z
    .preprocess(
      emptyStringToUndefined,
      z.enum(["SALEOR", "BUTTER_CMS"]).optional(),
    )
    .default("SALEOR"),
  NEXT_PUBLIC_SEARCH_SERVICE: z
    .preprocess(
      emptyStringToUndefined,
      z.enum(["SALEOR", "ALGOLIA"]).optional(),
    )
    .default("SALEOR"),
  ENVIRONMENT: z
    .enum(["TEST", "LOCAL", "DEVELOPMENT", "PRODUCTION", "STAGING"])
    .default("LOCAL"),
  NEXT_PUBLIC_BUTTER_CMS_API_KEY: z.string().trim().optional(),
  NEXT_PUBLIC_DEFAULT_CHANNEL: z
    .string()
    .trim()
    .pipe(z.enum(SUPPORTED_CHANNELS)),
  NEXT_PUBLIC_DEFAULT_EMAIL: z
    .string()
    .trim()
    .email()
    .default("contact@mirumee.com"),
  NEXT_PUBLIC_DEFAULT_PAGE_TITLE: z
    .string()
    .trim()
    .default("BestElectronics Storefront"),
  NEXT_PUBLIC_SALEOR_API_URL: z.string().url().trim(),
  NEXT_PUBLIC_STOREFRONT_URL: z.string().url().trim(),
  PAYMENT_APP_ID: z.string().trim().optional(),
  STRIPE_PUBLIC_KEY: z.string().trim().optional(),
  // Algolia specific
  NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().trim().min(1).default("YOUR_APP_ID"),
  NEXT_PUBLIC_ALGOLIA_API_KEY: z.string().trim().min(1).default("YOUR_API_KEY"),
});

export const clientEnvs = schema.parse({
  NEXT_PUBLIC_CMS_SERVICE: process.env.NEXT_PUBLIC_CMS_SERVICE,
  NEXT_PUBLIC_SEARCH_SERVICE: process.env.NEXT_PUBLIC_SEARCH_SERVICE,
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  NEXT_PUBLIC_BUTTER_CMS_API_KEY: process.env.NEXT_PUBLIC_BUTTER_CMS_API_KEY,
  NEXT_PUBLIC_DEFAULT_CHANNEL: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL,
  NEXT_PUBLIC_DEFAULT_EMAIL: process.env.NEXT_PUBLIC_DEFAULT_EMAIL,
  NEXT_PUBLIC_DEFAULT_PAGE_TITLE: process.env.NEXT_PUBLIC_DEFAULT_PAGE_TITLE,
  NEXT_PUBLIC_SALEOR_API_URL: process.env.NEXT_PUBLIC_SALEOR_API_URL,
  NEXT_PUBLIC_STOREFRONT_URL: resolveDefaultStorefrontUrl(),
  PAYMENT_APP_ID: process.env.NEXT_PUBLIC_PAYMENT_APP_ID,
  STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  NEXT_PUBLIC_ALGOLIA_API_KEY: process.env.NEXT_PUBLIC_ALGOLIA_API_KEY,
});

export const isStripeClientConfigured = Boolean(
  clientEnvs.PAYMENT_APP_ID && clientEnvs.STRIPE_PUBLIC_KEY,
);
