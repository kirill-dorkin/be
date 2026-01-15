import { execSync } from "node:child_process";

const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL?.trim();

if (!saleorApiUrl) {
  console.warn(
    "Skipping GraphQL codegen because NEXT_PUBLIC_SALEOR_API_URL is not set.",
  );
  process.exit(0);
}

execSync("graphql-codegen --config ./codegen.ts --project saleor", {
  stdio: "inherit",
});
