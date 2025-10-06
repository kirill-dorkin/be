import { cpSync, existsSync, rmSync, statSync, symlinkSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = process.cwd();
const storefrontBuildDir = join(repoRoot, "apps", "storefront", ".next");
const rootNextDir = join(repoRoot, ".next");

if (!existsSync(storefrontBuildDir) || !statSync(storefrontBuildDir, { throwIfNoEntry: false })?.isDirectory()) {
  console.error(
    `Expected Next.js build output at ${relative(repoRoot, storefrontBuildDir)}, but it was not found. ` +
      "Ensure that the storefront app build has completed successfully before running this script."
  );
  process.exit(1);
}

if (existsSync(rootNextDir)) {
  rmSync(rootNextDir, { recursive: true, force: true });
}

const symlinkType = process.platform === "win32" ? "junction" : "dir";

try {
  symlinkSync(storefrontBuildDir, rootNextDir, symlinkType);

  console.log(
    `Linked storefront build output from ${relative(repoRoot, storefrontBuildDir)} to ${relative(
      repoRoot,
      rootNextDir
    )} for Vercel deployment using a ${symlinkType === "dir" ? "symlink" : symlinkType}.`
  );
} catch (error) {
  console.warn(
    "Failed to create symlink for storefront build output. Falling back to copying the directory.",
    error
  );

  cpSync(storefrontBuildDir, rootNextDir, { recursive: true });

  console.log(
    `Copied storefront build output from ${relative(repoRoot, storefrontBuildDir)} to ${relative(
      repoRoot,
      rootNextDir
    )} for Vercel deployment.`
  );
}
