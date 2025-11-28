import React from "react";
import { describe, expect, it, vi } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ReactNamespace = React;

vi.mock("next-intl/server", () => ({
  getTranslations: async () => {
    const t = (key: string) => key;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    (t as any).raw = (key: string) => key;
    
return t;
  },
}));

describe("TermsOfUsePage", () => {
  it("renders without throwing", async () => {
    const mod = await import("../page");

    await expect(
      mod.default({ params: Promise.resolve({ locale: "en-GB" }) }),
    ).resolves.toBeTruthy();
  });
});
