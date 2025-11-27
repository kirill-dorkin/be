import { describe, expect, it, vi } from "vitest";

import { type User } from "@nimara/domain/objects/User";

import { safeUserGet } from "../safe-user";

const user: User = {
  id: "1",
  email: "test@example.com",
} as User;

describe("safeUserGet", () => {
  it("returns user on success", async () => {
    const userService = {
      userGet: vi.fn(async () => ({ ok: true as const, data: user })),
    };

    const result = await safeUserGet("token", userService);

    expect(result).toEqual(user);
  });

  it("returns null on error result", async () => {
    const userService = {
      userGet: vi.fn(async () => ({ ok: false as const, errors: ["fail"] })),
    };

    const result = await safeUserGet("token", userService);

    expect(result).toBeNull();
  });

  it("returns null on exception", async () => {
    const userService = {
      userGet: vi.fn(async () => {
        throw new Error("boom");
      }),
    };

    const result = await safeUserGet("token", userService);

    expect(result).toBeNull();
  });

  it("returns null on timeout", async () => {
    const userService = {
      userGet: vi.fn(
        async () => await new Promise(() => {
          // never resolve
        }),
      ),
    };

    const result = await safeUserGet("token", userService, { timeoutMs: 10 });

    expect(result).toBeNull();
  });
});
