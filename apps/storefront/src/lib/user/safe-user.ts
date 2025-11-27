import type { User } from "@nimara/domain/objects/User";

import { storefrontLogger } from "@/services/logging";

type UserGetResult =
  | { ok: true; data: User | null }
  | { ok: false; errors?: unknown };

export const safeUserGet = async (
  accessToken: string | null | undefined,
  userService: { userGet: (token?: string | null) => Promise<UserGetResult> },
  { timeoutMs = 8000 }: { timeoutMs?: number } = {},
): Promise<User | null> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("USER_GET_TIMEOUT")), timeoutMs),
  );

  try {
    const result = await Promise.race([
      userService.userGet(accessToken),
      timeout,
    ]);

    if (result.ok) {
      return result.data ?? null;
    }

    storefrontLogger.error("[safeUserGet] userGet returned errors", {
      errors: result.errors,
    });

    return null;
  } catch (error) {
    storefrontLogger.error("[safeUserGet] userGet failed", { error });

    return null;
  }
};
