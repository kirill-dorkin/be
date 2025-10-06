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
    const storefrontRoot = join(repoRoot, "apps", "storefront");

    // Only mirror workspace directories that the Vercel bundler expects to
    // live at the repository root. Avoid linking the top-level node_modules as
    // an absolute path (e.g. "/node_modules"), because the bundler rejects
    // assets that resolve outside of the project directory when tracing
    // serverless functions.
    const symlinkMap = [
      {
        linkPath: join(repoRoot, "src"),
        targetPath: join(storefrontRoot, "src"),
        logMessage: "Linked src directory for Vercel bundler compatibility.",
      },
      {
        linkPath: join(repoRoot, "public"),
        targetPath: join(storefrontRoot, "public"),
        logMessage: "Linked public directory for Vercel bundler compatibility.",
      },
      {
        linkPath: join(repoRoot, "messages"),
        targetPath: join(storefrontRoot, "messages"),
        logMessage: "Linked messages directory for Vercel bundler compatibility.",
      },
    ];

    symlinkMap.forEach(({ linkPath, targetPath, logMessage }) => {
      try {
        const targetExists =
          statSync(targetPath, { throwIfNoEntry: false })?.isDirectory() ?? false;
        const linkStats = lstatSync(linkPath, {
          throwIfNoEntry: false,
        });

        if (targetExists && !linkStats) {
          symlinkSync(targetPath, linkPath, symlinkType);
          console.log(logMessage);
        }
      } catch (error) {
        console.warn(
          `Failed to prepare symlink at ${linkPath} pointing to ${targetPath}.`
            + " Vercel bundler may fail if this resource is required during tracing.",
          error,
        );
      }
    });
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
