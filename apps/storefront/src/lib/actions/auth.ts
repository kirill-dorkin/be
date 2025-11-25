"use server";

import { cookies } from "next/headers";

import { saleorAuthClient } from "@nimara/infrastructure/auth/client";

import { AUTH_COOKIE_OPTIONS, COOKIE_KEY } from "@/config";
import { storefrontLogger } from "@/services/logging";

export async function handleLogout() {
  (await saleorAuthClient()).signOut();

  const cookieStore = await cookies();

  const deleteOptions = { path: AUTH_COOKIE_OPTIONS.path };

  cookieStore.delete(COOKIE_KEY.accessToken, deleteOptions);
  cookieStore.delete(COOKIE_KEY.refreshToken, deleteOptions);
  cookieStore.delete(COOKIE_KEY.checkoutId, deleteOptions);

  storefrontLogger.debug("Cleared auth and checkout cookies after logout.");
}

export async function setAccessToken(value: string) {
  (await cookies()).set(COOKIE_KEY.accessToken, value, AUTH_COOKIE_OPTIONS);
}

export async function setRefreshToken(value: string) {
  (await cookies()).set(COOKIE_KEY.refreshToken, value, AUTH_COOKIE_OPTIONS);
}
