import { ArrowRight, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

import { AnimatedCounter } from "./animated-counter";

export async function ModernHero() {
  const t = await getTranslations("home");

  return (
    <section className="relative w-full overflow-x-clip bg-background">
      {/* Top fade - smooth transition from header */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-32 bg-gradient-to-b from-background via-background/70 to-transparent" />

      {/* Animated orbs - positioned beyond viewport for full coverage */}
      <div className="pointer-events-none absolute inset-0 w-full overflow-visible">
        <div className="absolute -left-32 top-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-400/15 via-yellow-400/8 to-transparent blur-3xl sm:-left-48 sm:h-[700px] sm:w-[700px]" />
        <div className="absolute -right-32 top-40 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-blue-400/12 via-purple-400/8 to-transparent blur-3xl sm:-right-48 sm:h-[800px] sm:w-[800px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/50 px-4 py-2 text-sm font-medium text-amber-900 backdrop-blur-sm dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100">
            <Sparkles className="h-4 w-4" />
            {t("hero.badge")}
          </div>

          {/* Main heading - OpenAI style */}
          <h1 className="mx-auto mb-8 max-w-4xl text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {t("hero.title.part1")}{" "}
            <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
              {t("hero.title.highlight")}
            </span>{" "}
            {t("hero.title.part2")}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            {t("hero.subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group min-w-[200px] bg-gradient-to-r from-amber-500 to-yellow-600 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:scale-105 hover:from-amber-600 hover:to-yellow-700 hover:shadow-xl hover:shadow-amber-500/40"
            >
              <LocalizedLink href={paths.search.asPath()}>
                {t("hero.cta.primary")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </LocalizedLink>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-w-[200px] border-2 bg-background/50 text-base font-semibold backdrop-blur-sm transition-all hover:scale-105 hover:bg-muted"
            >
              {/* <LocalizedLink href={paths.services.asPath()}>
                {t("hero.cta.secondary")}
              </LocalizedLink> */}
            </Button>
          </div>

          {/* Stats - Minimalist style */}
          <div className="mt-20 grid grid-cols-2 gap-8 sm:gap-12 lg:grid-cols-4">
            <div className="space-y-3">
              <AnimatedCounter
                value={500}
                suffix="+"
                className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl"
              />
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hero.stats.customers")}
              </div>
            </div>

            <div className="space-y-3">
              <AnimatedCounter
                value={3000}
                suffix="+"
                className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl"
              />
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hero.stats.products")}
              </div>
            </div>

            <div className="space-y-3">
              <AnimatedCounter
                value={98}
                suffix="%"
                className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl"
              />
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hero.stats.satisfaction")}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
                24/7
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hero.stats.support")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
