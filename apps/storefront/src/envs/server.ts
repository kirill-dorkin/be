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

const schema = z.object({
  // Saleor envs
  SALEOR_APP_TOKEN: sanitizeEnv(z.string()),
  STRIPE_SECRET_KEY: sanitizeEnv(z.string().optional()),
});

type Schema = z.infer<typeof schema>;

export const serverEnvs = isSsr
  ? schema.parse({
      SALEOR_APP_TOKEN: process.env.SALEOR_APP_TOKEN,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    })
  : ({} as Schema);
