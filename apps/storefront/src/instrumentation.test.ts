import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type ResolveModule = (id: string, options?: { paths?: string[] }) => string;

describe("instrumentation", () => {
  const originalOtelServiceName = process.env.OTEL_SERVICE_NAME;
  const originalSentryDsn = process.env.SENTRY_DSN;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    delete process.env.OTEL_SERVICE_NAME;
    delete process.env.SENTRY_DSN;

    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    for (const moduleId of ["@vercel/otel"]) {
      try {
        vi.doUnmock(moduleId);
      } catch {
        // Module was not mocked in this test run.
      }
    }
    vi.resetModules();
    process.env.OTEL_SERVICE_NAME = originalOtelServiceName;
    process.env.SENTRY_DSN = originalSentryDsn;
  });

  it("registers OpenTelemetry when the context file exists", async () => {
    process.env.OTEL_SERVICE_NAME = "storefront";

    const existsSyncMock = vi.fn().mockReturnValue(true);
    const resolveMock = vi.fn().mockReturnValue("/tmp/context.js");
    const registerOTel = vi.fn();

    vi.doMock("@vercel/otel", () => ({
      registerOTel,
    }), { virtual: true });

    const instrumentation = await import("./instrumentation");

    instrumentation.__internal.setNodeDependenciesLoader(async () => ({
      existsSync: existsSyncMock,
      resolve: resolveMock as unknown as ResolveModule,
    }));

    const { register } = instrumentation;

    await register();

    expect(resolveMock).toHaveBeenCalledWith(
      "@opentelemetry/api/build/src/api/context.js",
    );
    expect(existsSyncMock).toHaveBeenCalledWith("/tmp/context.js");
    expect(registerOTel).toHaveBeenCalledWith({ serviceName: "storefront" });
    expect(logSpy).toHaveBeenCalledWith("OpenTelemetry registered.");

    instrumentation.__internal.resetNodeDependenciesLoader();
  });

  it("locates the context file via the @vercel/otel dependency when direct resolution fails", async () => {
    process.env.OTEL_SERVICE_NAME = "storefront";

    const fallbackContextPath =
      "/tmp/node_modules/.pnpm/@vercel+otel/node_modules/@opentelemetry/api/build/src/api/context.js";
    const existsSyncMock = vi
      .fn<(path: string) => boolean>()
      .mockImplementation((path) => path === fallbackContextPath);

    const resolveMock = vi
      .fn<ResolveModule>()
      .mockImplementation((id: string) => {
        if (id === "@opentelemetry/api/build/src/api/context.js") {
          const error = Object.assign(new Error("not found"), {
            code: "MODULE_NOT_FOUND",
          });

          throw error;
        }

        if (id === "@opentelemetry/api/build/esm/api/context.js") {
          const error = Object.assign(new Error("not found"), {
            code: "MODULE_NOT_FOUND",
          });

          throw error;
        }

        if (id === "@vercel/otel") {
          return "/tmp/node_modules/.pnpm/@vercel+otel/node_modules/@vercel/otel/dist/node/index.js";
        }

        throw new Error(`Unexpected module identifier: ${id}`);
      });

    const registerOTel = vi.fn();

    vi.doMock("@vercel/otel", () => ({
      registerOTel,
    }), { virtual: true });

    const instrumentation = await import("./instrumentation");

    instrumentation.__internal.setNodeDependenciesLoader(async () => ({
      existsSync: existsSyncMock,
      resolve: resolveMock,
    }));

    const { register } = instrumentation;

    await register();

    expect(resolveMock).toHaveBeenCalledWith(
      "@opentelemetry/api/build/src/api/context.js",
    );
    expect(resolveMock).toHaveBeenCalledWith(
      "@opentelemetry/api/build/esm/api/context.js",
    );
    expect(resolveMock).toHaveBeenCalledWith("@vercel/otel");
    expect(existsSyncMock).toHaveBeenCalledWith(fallbackContextPath);
    expect(registerOTel).toHaveBeenCalledWith({ serviceName: "storefront" });
    expect(logSpy).toHaveBeenCalledWith("OpenTelemetry registered.");
    expect(warnSpy).not.toHaveBeenCalled();

    instrumentation.__internal.resetNodeDependenciesLoader();
  });

  it("warns and skips registration when the context file is missing", async () => {
    process.env.OTEL_SERVICE_NAME = "storefront";

    const existsSyncMock = vi.fn().mockReturnValue(false);
    const resolveMock = vi.fn().mockReturnValue("/tmp/context.js");
    const registerOTel = vi.fn();

    vi.doMock("@vercel/otel", () => ({
      registerOTel,
    }), { virtual: true });

    const instrumentation = await import("./instrumentation");

    instrumentation.__internal.setNodeDependenciesLoader(async () => ({
      existsSync: existsSyncMock,
      resolve: resolveMock as unknown as ResolveModule,
    }));

    const { register } = instrumentation;

    await register();

    expect(registerOTel).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      "OpenTelemetry registration skipped: context API file was not found in node_modules. Ensure the project is built with access to @opentelemetry/api, or remove OTEL_SERVICE_NAME to disable instrumentation.",
    );
    expect(warnSpy).toHaveBeenCalledWith("Missing file path: /tmp/context.js");

    instrumentation.__internal.resetNodeDependenciesLoader();
  });

  it("warns when the OpenTelemetry context dependency cannot be resolved", async () => {
    process.env.OTEL_SERVICE_NAME = "storefront";

    const moduleNotFoundError = Object.assign(new Error("not found"), {
      code: "MODULE_NOT_FOUND",
    });
    const resolveMock = vi.fn().mockImplementation(() => {
      throw moduleNotFoundError;
    });

    const instrumentation = await import("./instrumentation");

    instrumentation.__internal.setNodeDependenciesLoader(async () => ({
      existsSync: vi.fn(),
      resolve: resolveMock as unknown as ResolveModule,
    }));

    const { register } = instrumentation;

    await register();

    expect(warnSpy).toHaveBeenCalledWith(
      "OpenTelemetry dependency '@opentelemetry/api' could not be resolved. Install it or remove OTEL_SERVICE_NAME to disable instrumentation.",
    );

    instrumentation.__internal.resetNodeDependenciesLoader();
  });
});
