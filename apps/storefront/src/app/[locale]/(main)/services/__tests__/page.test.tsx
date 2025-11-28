// Needed for server components rendering in tests
import React from "react";
import { describe, expect, it, vi } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ReactNamespace = React;

// Mock next-intl translations
vi.mock("next-intl/server", () => ({
  getTranslations: async () => {
    const t = (key: string) => key;
    // Provide raw for templates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    (t as any).raw = (key: string) => key;
    
return t;
  },
}));

// Mock heavy components
vi.mock("../_components/services-estimator", () => ({
  ServicesEstimator: () => null,
}));

// Mock region and user services
vi.mock("@/regions/server", () => ({
  getCurrentRegion: async () => ({
    language: { locale: "en-GB" },
    market: { currency: "GBP" },
  }),
}));

vi.mock("@/services/user", () => ({
  getUserService: async () => ({
    userGet: async () => ({ ok: false as const }),
  }),
}));

// Access token mock
vi.mock("@/auth", () => ({
  getAccessToken: async () => null,
}));

describe("ServicesPage server rendering", () => {
  it("renders without throwing when user fetch fails", async () => {
    const mod = await import("../page");

    await expect(mod.default()).resolves.toBeTruthy();
  });
});
