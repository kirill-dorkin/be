import { redirect as nextRedirect } from "next/navigation";

import { localePrefixes } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { DEFAULT_LOCALE, type SupportedLocale } from "@/regions/types";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

const buildLocalizedPath = (locale: SupportedLocale, path: string) => {
  if (locale === DEFAULT_LOCALE) {
    return path;
  }

  const prefix = localePrefixes[
    locale as Exclude<SupportedLocale, typeof DEFAULT_LOCALE>
  ];

  return `${prefix}${path}`;
};

export default async function StaffHomeRedirect({ params }: PageProps) {
  const { locale } = await params;

  nextRedirect(buildLocalizedPath(locale, paths.staff.orders.asPath()));
}
