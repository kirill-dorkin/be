import { z } from "zod";

const sanitizeEnv = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();

    return trimmed.length === 0 ? undefined : trimmed;
  }, schema);

const optionalString = () =>
  sanitizeEnv(
    z
      .string()
      .trim()
      .min(1)
      .optional(),
  );

const schema = z.object({
  NEXT_PUBLIC_CMS_SERVICE: sanitizeEnv(
    z.enum(["SALEOR", "BUTTER_CMS"]).default("SALEOR"),
  ),
  NEXT_PUBLIC_SEARCH_SERVICE: sanitizeEnv(
    z.enum(["SALEOR", "ALGOLIA"]).default("SALEOR"),
  ),
  ENVIRONMENT: sanitizeEnv(
    z
      .enum(["TEST", "LOCAL", "DEVELOPMENT", "PRODUCTION", "STAGING"])
      .default("LOCAL"),
  ),
  NEXT_PUBLIC_BUTTER_CMS_API_KEY: optionalString(),
  NEXT_PUBLIC_DEFAULT_CHANNEL: sanitizeEnv(z.string().trim()),
  NEXT_PUBLIC_DEFAULT_EMAIL: sanitizeEnv(
    z
      .string()
      .trim()
      .email()
      .default("contact@mirumee.com"),
  ),
  NEXT_PUBLIC_DEFAULT_PAGE_TITLE: sanitizeEnv(
    z
      .string()
      .trim()
      .default("Nimara Storefront"),
  ),
  NEXT_PUBLIC_SALEOR_API_URL: sanitizeEnv(z.string().url().trim()),
  NEXT_PUBLIC_STOREFRONT_URL: sanitizeEnv(z.string().url().trim()),
  PAYMENT_APP_ID: optionalString(),
  STRIPE_PUBLIC_KEY: optionalString(),
  // Algolia specific
  NEXT_PUBLIC_ALGOLIA_APP_ID: sanitizeEnv(
    z.string().trim().min(1).default("YOUR_APP_ID"),
  ),
  NEXT_PUBLIC_ALGOLIA_API_KEY: sanitizeEnv(
    z.string().trim().min(1).default("YOUR_API_KEY"),
  ),
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
  NEXT_PUBLIC_STOREFRONT_URL:
    process.env.NEXT_PUBLIC_STOREFRONT_URL ||
    `https://${process.env.VERCEL_BRANCH_URL || "localhost:3000"}`,
  PAYMENT_APP_ID: process.env.NEXT_PUBLIC_PAYMENT_APP_ID,
  STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  NEXT_PUBLIC_ALGOLIA_API_KEY: process.env.NEXT_PUBLIC_ALGOLIA_API_KEY,
});
