import { z } from "zod";

import { prepareConfig } from "@/lib/zod/util";

import packageJson from "../package.json";

const configSchema = z.object({
  NAME: z.string().default(packageJson.name),
  VERSION: z.string().default(packageJson.version),
  ENVIRONMENT: z.string().default("LOCAL"),
  SALEOR_URL: z.string().url(),
  SALEOR_DOMAIN: z.string(),
  FETCH_TIMEOUT: z
    .number()
    .default(10000)
    .describe("Fetch timeout in milliseconds."),
  VERCEL_ACCESS_TOKEN: z
    .string()
    .default("")
    .describe("Vercel access token."),
  VERCEL_TEAM_ID: z
    .string()
    .default("")
    .describe("Your Vercel Team ID."),
  VERCEL_EDGE_CONFIG_ID: z
    .string()
    .default("")
    .describe("Edge config database ID."),
  CONFIG_KEY: z
    .string()
    .describe("Config provider key.")
    .default("nimara-config"),
});

const FALLBACK_SALEOR_API_URL = "https://demo.saleor.io/graphql/";

const resolvedSaleorApiUrl =
  process.env.NEXT_PUBLIC_SALEOR_API_URL ?? FALLBACK_SALEOR_API_URL;

if (!process.env.NEXT_PUBLIC_SALEOR_API_URL) {
  console.warn(
    "[stripe] NEXT_PUBLIC_SALEOR_API_URL is not defined. Using demo Saleor endpoint for build-time configuration.",
  );
}

const warnIfMissing = (envName: string) => {
  if (!process.env[envName]) {
    console.warn(`[stripe] ${envName} is not defined. Using empty fallback value for build-time configuration.`);
  }
};

warnIfMissing("VERCEL_ACCESS_TOKEN");
warnIfMissing("VERCEL_TEAM_ID");
warnIfMissing("VERCEL_EDGE_CONFIG_ID");
warnIfMissing("NEXT_PUBLIC_ENVIRONMENT");

const saleorUrl = new URL(resolvedSaleorApiUrl);

const parsed = prepareConfig({
  name: "App",
  schema: configSchema,
  input: {
    ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT ?? "LOCAL",
    SALEOR_URL: saleorUrl.origin,
    SALEOR_DOMAIN: saleorUrl.host,
  },
  serverOnly: true,
});

export const CONFIG = {
  ...parsed,
  RELEASE: `${parsed.NAME}@${parsed.VERSION}`,
  APP_ID: `${parsed.ENVIRONMENT}.${parsed.NAME}`,
};
