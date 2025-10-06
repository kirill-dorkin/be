import { cpSync, existsSync, lstatSync, rmSync, statSync, symlinkSync } from "node:fs";
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

const shouldCopyOnVercel = process.env.VERCEL === "1";
const symlinkType = process.platform === "win32" ? "junction" : "dir";

if (shouldCopyOnVercel) {
  cpSync(storefrontBuildDir, rootNextDir, { recursive: true });

  console.log(
    `Copied storefront build output from ${relative(repoRoot, storefrontBuildDir)} to ${relative(
      repoRoot,
      rootNextDir
    )} for Vercel deployment.`
  );

  if (process.platform !== "win32") {
    const rootNodeModulesPath = "/node_modules";
    const repoNodeModulesPath = join(repoRoot, "node_modules");

    try {
      const hasRepoNodeModules =
        statSync(repoNodeModulesPath, { throwIfNoEntry: false })?.isDirectory() ?? false;
      const rootNodeModulesStats = lstatSync(rootNodeModulesPath, {
        throwIfNoEntry: false,
      });

      if (hasRepoNodeModules && !rootNodeModulesStats) {
        symlinkSync(repoNodeModulesPath, rootNodeModulesPath, symlinkType);
        console.log("Linked /node_modules to project node_modules for Vercel bundler compatibility.");
      }
    } catch (error) {
      console.warn(
        "Failed to prepare /node_modules symlink for Vercel bundler compatibility."
          + " OpenTelemetry packaging may fail if the build environment disallows this operation.",
        error,
      );
    }
  }
} else {
  const rootNextDirParent = join(rootNextDir, "..");
  const symlinkTarget = symlinkType === "junction"
    ? storefrontBuildDir
    : relative(rootNextDirParent, storefrontBuildDir);

  try {
    symlinkSync(symlinkTarget, rootNextDir, symlinkType);

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
}
