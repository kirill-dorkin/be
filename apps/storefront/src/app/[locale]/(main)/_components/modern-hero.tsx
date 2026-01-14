import { ArrowRight, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

import { AnimatedCounter } from "./animated-counter";
import { ClubInviteModal } from "./club-invite-modal";

type ModernHeroProps = {
  user: User | null;
};

export async function ModernHero({ user }: ModernHeroProps) {
  const t = await getTranslations("home");

  return (
    <section className="bg-muted/10 relative w-full overflow-hidden">
      <ClubInviteModal isAuthenticated={Boolean(user)} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 shadow-sm">
            <Sparkles className="h-4 w-4" />
            {t("hero.badge")}
          </div>

          <h1 className="text-foreground mx-auto mb-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t("hero.title.part1")}{" "}
            <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
              {t("hero.title.highlight")}
            </span>{" "}
            {t("hero.title.part2")}
          </h1>

          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-base leading-relaxed sm:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group min-w-[200px] bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition-all duration-300 ease-out hover:scale-[1.02] hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 hover:shadow-xl hover:shadow-amber-500/40"
            >
              <LocalizedLink href={paths.services.asPath()}>
                {t("hero.cta.primary")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </LocalizedLink>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-background/70 hover:bg-muted min-w-[200px] border-2 text-base font-semibold backdrop-blur-sm transition-all hover:scale-105"
            >
              <LocalizedLink href={paths.search.asPath()}>
                {t("hero.cta.secondary")}
              </LocalizedLink>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 sm:gap-10 lg:grid-cols-4">
            <div className="space-y-2">
              <AnimatedCounter
                value={500}
                className="from-foreground to-foreground/70 bg-gradient-to-br bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl"
              />
              <div className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                {t("hero.stats.customers")}
              </div>
            </div>

            <div className="space-y-2">
              <AnimatedCounter
                value={3000}
                className="from-foreground to-foreground/70 bg-gradient-to-br bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl"
              />
              <div className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                {t("hero.stats.products")}
              </div>
            </div>

            <div className="space-y-2">
              <AnimatedCounter
                value={98}
                suffix="%"
                className="from-foreground to-foreground/70 bg-gradient-to-br bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl"
              />
              <div className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                {t("hero.stats.satisfaction")}
              </div>
            </div>

            <div className="space-y-2">
              <div className="from-foreground to-foreground/70 bg-gradient-to-br bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
                24/7
              </div>
              <div className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                {t("hero.stats.support")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
