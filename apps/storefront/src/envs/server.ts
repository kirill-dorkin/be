import { z } from "zod";

import { isSsr } from "@nimara/infrastructure/config";

const schema = z.object({
  // Saleor envs
  SALEOR_APP_TOKEN: z.string(),
  SERVICE_CHANNEL_SLUG: z.string().default("default-channel"),
  SERVICE_WORKER_GROUP_NAME: z.string().default("Repair Workers"),
  SERVICE_COURIER_GROUP_NAME: z.string().default("Repair Couriers"),
  STRIPE_SECRET_KEY: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

export const serverEnvs = isSsr
  ? schema.parse({
      SALEOR_APP_TOKEN: process.env.SALEOR_APP_TOKEN,
      SERVICE_CHANNEL_SLUG: process.env.SERVICE_CHANNEL_SLUG,
      SERVICE_WORKER_GROUP_NAME: process.env.SERVICE_WORKER_GROUP_NAME,
      SERVICE_COURIER_GROUP_NAME: process.env.SERVICE_COURIER_GROUP_NAME,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    })
  : ({} as Schema);

export const isStripeServerConfigured = Boolean(serverEnvs.STRIPE_SECRET_KEY);
