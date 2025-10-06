type NodeError = NodeJS.ErrnoException & { code?: string };

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

export async function register() {
  if (process.env.OTEL_SERVICE_NAME) {
    // By making this path dynamic, we ensure that bundler
    // does not include the OpenTelemetry package in the bundle.
    const otelPath = "@vercel/otel";

    try {
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
