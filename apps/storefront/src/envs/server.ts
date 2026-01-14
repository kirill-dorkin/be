import { z } from "zod";

import { isSsr } from "@nimara/infrastructure/config";

const schema = z.object({
  // Saleor envs
  SALEOR_APP_TOKEN: z.string(),
  SALEOR_STAFF_TOKEN: z.string().optional(),
  SERVICE_CHANNEL_SLUG: z.string().default("default-channel"),
  SERVICE_LEAD_WORKER_GROUP_NAME: z.string().optional(),
  SERVICE_LEAD_PRIORITY_MINUTES: z.coerce.number().default(5),
  SERVICE_WORKER_GROUP_NAME: z.string().default("Repair Workers"),
  SERVICE_COURIER_GROUP_NAME: z.string().default("Repair Couriers"),
  STRIPE_SECRET_KEY: z.string().optional(),
  ACCOUNT_CONFIRMATION_REDIRECT_URL: z.string().url().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  TELEGRAM_THREAD_ID: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

export const serverEnvs = isSsr
  ? schema.parse({
      SALEOR_APP_TOKEN: process.env.SALEOR_APP_TOKEN,
      SALEOR_STAFF_TOKEN: process.env.SALEOR_STAFF_TOKEN,
      SERVICE_CHANNEL_SLUG: process.env.SERVICE_CHANNEL_SLUG,
      SERVICE_LEAD_WORKER_GROUP_NAME:
        process.env.SERVICE_LEAD_WORKER_GROUP_NAME,
      SERVICE_LEAD_PRIORITY_MINUTES:
        process.env.SERVICE_LEAD_PRIORITY_MINUTES,
      SERVICE_WORKER_GROUP_NAME: process.env.SERVICE_WORKER_GROUP_NAME,
      SERVICE_COURIER_GROUP_NAME: process.env.SERVICE_COURIER_GROUP_NAME,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      ACCOUNT_CONFIRMATION_REDIRECT_URL:
        process.env.SALEOR_ACCOUNT_CONFIRMATION_REDIRECT_URL ??
        process.env.ACCOUNT_CONFIRMATION_REDIRECT_URL,
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
      TELEGRAM_THREAD_ID: process.env.TELEGRAM_THREAD_ID,
    })
  : ({} as Schema);

export const isStripeServerConfigured = Boolean(serverEnvs.STRIPE_SECRET_KEY);
