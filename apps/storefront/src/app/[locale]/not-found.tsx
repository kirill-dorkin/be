import { getTranslations } from "next-intl/server";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export default async function NotFound() {
  const t = await getTranslations("not-found");

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="space-y-4">
        <p className="text-8xl font-semibold">404</p>
        <h1 className="text-2xl font-semibold leading-tight md:text-3xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground max-w-xl text-base md:text-lg">
          {t("description")}
        </p>
      </div>

      <LocalizedLink
        href={paths.home.asPath()}
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition"
      >
        {t("cta")}
      </LocalizedLink>
    </div>
  );
}
