import { describe, expect, it } from "vitest";

import { shouldRetryAccountRegisterWithRedirect } from "../account-register";

describe("shouldRetryAccountRegisterWithRedirect", () => {
  it("returns false when there are no errors", () => {
    expect(shouldRetryAccountRegisterWithRedirect()).toBe(false);
    expect(shouldRetryAccountRegisterWithRedirect([])).toBe(false);
  });

  it("returns false when redirect error is not required type", () => {
    expect(
      shouldRetryAccountRegisterWithRedirect([
        {
          field: "redirectUrl",
          originalError: { code: "INVALID" },
        },
      ]),
    ).toBe(false);
  });

  it("returns true when redirectUrl error is required", () => {
    expect(
      shouldRetryAccountRegisterWithRedirect([
        {
          field: "redirectUrl",
          originalError: { code: "REQUIRED" },
        },
      ]),
    ).toBe(true);
  });
});
