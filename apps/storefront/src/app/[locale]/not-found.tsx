import { Home, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export default async function NotFound() {
  const t = await getTranslations("not-found");

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-8 py-16 text-center">
      {/* Animated 404 with gradient */}
      <div className="relative">
        <div className="from-primary/20 via-primary/30 to-primary/20 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 absolute inset-0 bg-gradient-to-r blur-3xl" />
        <h1 className="relative bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-[10rem] font-bold leading-none text-transparent md:text-[12rem] dark:from-slate-100 dark:via-slate-300 dark:to-slate-100">
          404
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-2xl space-y-4">
        <h2 className="text-2xl font-semibold leading-tight text-slate-900 md:text-3xl dark:text-slate-100">
          {t("title")}
        </h2>
        <p className="text-muted-foreground text-base md:text-lg">
          {t("description")}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <LocalizedLink href={paths.home.asPath()}>
          <Button size="lg" className="group gap-2">
            <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
            {t("cta")}
          </Button>
        </LocalizedLink>

        <LocalizedLink href={paths.search.asPath()}>
          <Button variant="outline" size="lg" className="group gap-2">
            <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
            {t("search-products")}
          </Button>
        </LocalizedLink>
      </div>

      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/5 dark:bg-primary/10 absolute -right-1/4 -top-1/2 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-primary/5 dark:bg-primary/10 absolute -bottom-1/2 -left-1/4 h-96 w-96 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
