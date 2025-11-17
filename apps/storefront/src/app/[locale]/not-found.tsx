import { ArrowLeft, Home, Search } from "lucide-react";
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
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 blur-3xl dark:from-primary/10 dark:via-primary/20 dark:to-primary/10" />
        <h1 className="relative bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-[10rem] font-bold leading-none text-transparent dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 md:text-[12rem]">
          404
        </h1>
      </div>

      {/* Content */}
      <div className="space-y-4 max-w-2xl">
        <h2 className="text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-100 md:text-3xl">
          {t("title")}
        </h2>
        <p className="text-base text-muted-foreground md:text-lg">
          {t("description")}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
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
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
        <div className="absolute -bottom-1/2 -left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
      </div>
    </div>
  );
}
