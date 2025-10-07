"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { COOKIE_KEY } from "@/config";
import { redirect } from "@/i18n/routing";
import { type SupportedLocale } from "@/regions/types";

export const handleLocaleChange = async (
  locale: SupportedLocale,
  redirectPath?: string,
) => {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_KEY.locale, locale);
  cookieStore.delete(COOKIE_KEY.checkoutId);
  const targetPath = redirectPath?.startsWith("/") ? redirectPath : "/";
  const [pathToRevalidate] = targetPath.split("?");

  revalidatePath(pathToRevalidate);

  redirect({
    href: targetPath,
    locale,
  });
};
