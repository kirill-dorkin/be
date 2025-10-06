type NodeError = NodeJS.ErrnoException & { code?: string };

type ResolveModule = (id: string, options?: { paths?: string[] }) => string;

type NodeDependencies = {
  existsSync: (path: string) => boolean;
  resolve: ResolveModule;
};

const createDefaultNodeDependenciesLoader = () => {
  let cachedDependencies: NodeDependencies | null = null;

  return async () => {
    if (cachedDependencies) {
      return cachedDependencies;
    }

    const [{ existsSync }, { createRequire }] = await Promise.all([
      import(/* webpackIgnore: true */ "node:fs"),
      import(/* webpackIgnore: true */ "node:module"),
    ]);

    const nodeRequire = createRequire(import.meta.url);

    cachedDependencies = {
      existsSync,
      resolve: nodeRequire.resolve.bind(nodeRequire) as ResolveModule,
    };

    return cachedDependencies;
  };
};

let loadNodeDependencies = createDefaultNodeDependenciesLoader();

const getNodeDependencies = () => loadNodeDependencies();

const isMissingOtelContextFileError = (error: unknown): error is NodeError => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as NodeError;

  return (
    err.code === "ENOENT" &&
    typeof err.message === "string" &&
    err.message.includes("@opentelemetry/api/build/src/api/context")
  );
};

const isModuleNotFoundError = (error: unknown): error is NodeError => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as NodeError;

  return err.code === "MODULE_NOT_FOUND" || err.code === "ERR_MODULE_NOT_FOUND";
};

const logMissingOtelContextWarning = () =>
  console.warn(
    "OpenTelemetry registration skipped: context API file was not found in node_modules. Ensure the project is built with access to @opentelemetry/api, or remove OTEL_SERVICE_NAME to disable instrumentation.",
  );

const CONTEXT_MODULE_IDS = [
  "@opentelemetry/api/build/src/api/context.js",
  "@opentelemetry/api/build/esm/api/context.js",
];

type ErrorFlags = {
  missingContext: boolean;
  moduleNotFound: boolean;
};

const tryResolveOtelContextFromOtelPackage = async (
  existsSync: (path: string) => boolean,
  resolve: ResolveModule,
  missingPaths: string[],
  errorFlags: ErrorFlags,
) => {
  try {
    const otelEntryPath = resolve("@vercel/otel");
    const pathModule = await import(/* webpackIgnore: true */ "node:path");

    const packageRoot = pathModule.join(
      pathModule.dirname(otelEntryPath),
      "..",
      "..",
    );
    const pnpmScopeRoot = pathModule.join(packageRoot, "..", "..");

    const fallbackSegments = [
      ["@opentelemetry", "api", "build", "src", "api", "context.js"],
      ["@opentelemetry", "api", "build", "esm", "api", "context.js"],
    ] as const;

    for (const segments of fallbackSegments) {
      const candidatePath = pathModule.join(pnpmScopeRoot, ...segments);

      if (existsSync(candidatePath)) {
        return true;
      }

      missingPaths.push(candidatePath);
    }
  } catch (error) {
    if (isMissingOtelContextFileError(error)) {
      errorFlags.missingContext = true;

      return false;
    }

    if (isModuleNotFoundError(error)) {
      errorFlags.moduleNotFound = true;

      return false;
    }

    throw error;
  }

  return false;
};

const hasOtelContextFile = async () => {
  const { existsSync, resolve } = await getNodeDependencies();

  const missingPaths: string[] = [];
  const errorFlags: ErrorFlags = {
    missingContext: false,
    moduleNotFound: false,
  };

  for (const moduleId of CONTEXT_MODULE_IDS) {
    try {
      const contextPath = resolve(moduleId);

      if (existsSync(contextPath)) {
        return true;
      }

      missingPaths.push(contextPath);
    } catch (error) {
      if (isMissingOtelContextFileError(error)) {
        errorFlags.missingContext = true;

        continue;
      }

      if (isModuleNotFoundError(error)) {
        errorFlags.moduleNotFound = true;

        continue;
      }

      throw error;
    }
  }

  if (
    await tryResolveOtelContextFromOtelPackage(
      existsSync,
      resolve,
      missingPaths,
      errorFlags,
    )
  ) {
    return true;
  }

  if (errorFlags.missingContext || missingPaths.length > 0) {
    logMissingOtelContextWarning();

    for (const missingPath of missingPaths) {
      console.warn(`Missing file path: ${missingPath}`);
    }
  }

  if (errorFlags.moduleNotFound) {
    console.warn(
      "OpenTelemetry dependency '@opentelemetry/api' could not be resolved. Install it or remove OTEL_SERVICE_NAME to disable instrumentation.",
    );
  }

  return false;
};

export const __internal = {
  setNodeDependenciesLoader(
    loader: () => Promise<NodeDependencies>,
  ) {
    loadNodeDependencies = loader;
  },
  resetNodeDependenciesLoader() {
    loadNodeDependencies = createDefaultNodeDependenciesLoader();
  },
};

export async function register() {
  if (process.env.OTEL_SERVICE_NAME) {
    // By making this path dynamic, we ensure that bundler
    // does not include the OpenTelemetry package in the bundle.
    const otelPath = "@vercel/otel";

    try {
      if (!(await hasOtelContextFile())) {
        return;
      }

      const { registerOTel } = await import(otelPath);

      try {
        registerOTel({
          serviceName: process.env.OTEL_SERVICE_NAME,
        });
        console.log("OpenTelemetry registered.");
      } catch (error) {
        if (isMissingOtelContextFileError(error)) {
          logMissingOtelContextWarning();
        } else {
          throw error;
        }
      }
    } catch (error) {
      if (isMissingOtelContextFileError(error)) {
        logMissingOtelContextWarning();
      } else if (isModuleNotFoundError(error)) {
        console.warn(
          "OpenTelemetry package '@vercel/otel' could not be resolved. Ensure it is installed or remove OTEL_SERVICE_NAME to disable instrumentation.",
        );
      } else {
        throw error;
      }
    }
  }

  if (process.env.SENTRY_DSN) {
    // By making this path dynamic, we ensure that bundler
    // does not include the OpenTelemetry package in the bundle.
    let sentryPath;

    if (process.env.NEXT_RUNTIME === "nodejs") {
      sentryPath = "../sentry.server.config";
    } else if (process.env.NEXT_RUNTIME === "edge") {
      sentryPath = "../sentry.edge.config";
    }

    if (sentryPath) {
      await import(sentryPath);
      console.log(`Sentry registered for ${process.env.NEXT_RUNTIME} runtime.`);
    }
  }
}
