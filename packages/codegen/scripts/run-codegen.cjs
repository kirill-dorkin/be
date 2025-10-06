#!/usr/bin/env node
const { spawn } = require("node:child_process");
const path = require("node:path");

const schemaUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;

if (!schemaUrl) {
  console.warn(
    "[codegen] NEXT_PUBLIC_SALEOR_API_URL is not defined. Skipping Saleor GraphQL code generation and using existing artifacts.",
  );
  process.exit(0);
}

const codegenBin = require.resolve("@graphql-codegen/cli/bin.js");
const configPath = path.join(__dirname, "..", "codegen.ts");

const child = spawn(process.execPath, [codegenBin, "--config", configPath, "--project", "saleor"], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("[codegen] Failed to run GraphQL code generator:", error);
  process.exit(1);
});
