import { z } from "zod";

import { isSsr } from "@nimara/infrastructure/config";

const sanitizeEnv = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();

    return trimmed.length === 0 ? undefined : trimmed;
  }, schema);

const FALLBACK_SALEOR_APP_TOKEN = "demo-saleor-app-token";

const schema = z.object({
  // Saleor envs
  SALEOR_APP_TOKEN: sanitizeEnv(z.string().default(FALLBACK_SALEOR_APP_TOKEN)),
  STRIPE_SECRET_KEY: sanitizeEnv(z.string().optional()),
});

type Schema = z.infer<typeof schema>;

const warnIfMissing = (envName: string, message: string) => {
  if (!process.env[envName]) {
    console.warn(`[storefront] ${message}`);
  }
};

if (isSsr) {
  warnIfMissing(
    "SALEOR_APP_TOKEN",
    `SALEOR_APP_TOKEN is not defined. Using fallback token "${FALLBACK_SALEOR_APP_TOKEN}" for build-time configuration.`,
  );
}

export const serverEnvs = isSsr
  ? schema.parse({
      SALEOR_APP_TOKEN: process.env.SALEOR_APP_TOKEN,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    })
  : ({} as Schema);
