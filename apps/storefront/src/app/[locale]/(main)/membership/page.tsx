import { Check, Crown, Headset, Sparkles, Star,TrendingDown, Truck, Wrench } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";
import { Card } from "@nimara/ui/components/card";

import { getAccessToken } from "@/auth";
import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { safeUserGet } from "@/lib/user/safe-user";
import { getUserService } from "@/services/user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("membership.meta");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function MembershipPage() {
  const [accessToken, userService, t] = await Promise.all([
    getAccessToken(),
    getUserService(),
    getTranslations("membership"),
  ]);

  const user = await safeUserGet(accessToken, userService);

  const benefits = [
    {
      icon: TrendingDown,
      title: t("benefits.product-discount.title"),
      description: t("benefits.product-discount.description"),
      highlight: "10%",
    },
    {
      icon: Wrench,
      title: t("benefits.repair-discount.title"),
      description: t("benefits.repair-discount.description"),
      highlight: "20%",
    },
    {
      icon: Truck,
      title: t("benefits.free-shipping.title"),
      description: t("benefits.free-shipping.description"),
      highlight: t("benefits.free-shipping.badge"),
    },
    {
      icon: Headset,
      title: t("benefits.priority-support.title"),
      description: t("benefits.priority-support.description"),
      highlight: "24/7",
    },
    {
      icon: Star,
      title: t("benefits.early-access.title"),
      description: t("benefits.early-access.description"),
      highlight: t("benefits.early-access.badge"),
    },
    {
      icon: Sparkles,
      title: t("benefits.exclusive-offers.title"),
      description: t("benefits.exclusive-offers.description"),
      highlight: t("benefits.exclusive-offers.badge"),
    },
  ];

  const guestFeatureKeys = [
    "comparison.guest.features.standard-prices",
    "comparison.guest.features.standard-shipping",
    "comparison.guest.features.regular-support",
    "comparison.guest.features.no-early-access",
  ] as const;

  const memberFeatureKeys = [
    "comparison.member.features.discounted-prices",
    "comparison.member.features.free-shipping",
    "comparison.member.features.priority-support",
    "comparison.member.features.early-access",
    "comparison.member.features.exclusive-deals",
    "comparison.member.features.special-events",
  ] as const;

  const faqKeys = [
    "how-to-join",
    "payment-methods",
    "cancel-anytime",
    "benefits-when",
    "discount-calculation",
  ] as const;

  return (
    <div className="bg-background overflow-x-hidden">
      {/* Hero секция */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-16 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20">
        {/* Fades smooth out the background transitions with surrounding sections */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-background via-background/90 to-transparent dark:from-background dark:via-background/80" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-background via-background/90 to-transparent dark:from-background dark:via-background/80" />

        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.15),transparent_50%)]" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.15),transparent_50%)]" />

        <div className="container relative z-20 mx-auto max-w-6xl px-4">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-2 text-white">
              <Crown className="mr-2 h-5 w-5" />
              <span className="font-semibold">{t("hero.badge")}</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-amber-600">199 сом</span>
                <span className="text-xl text-muted-foreground">/ {t("hero.per-month")}</span>
              </div>

              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-lg px-8 py-6">
                <Crown className="mr-2 h-5 w-5" />
                {user ? t("hero.activate-cta") : t("hero.join-cta")}
              </Button>

              <p className="text-sm text-muted-foreground">{t("hero.cancel-anytime")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("benefits.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("benefits.subtitle")}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border-2 p-6 transition-all hover:border-amber-300 hover:shadow-lg dark:hover:border-amber-700"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-100 opacity-20 dark:bg-amber-900" />

                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
                      <benefit.icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {benefit.highlight}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Сравнение */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("comparison.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("comparison.subtitle")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Гость */}
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t("comparison.guest.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("comparison.guest.subtitle")}</p>
              </div>

              <ul className="space-y-3">
                {guestFeatureKeys.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-muted p-1">
                      <Check className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {t(key)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Член сообщества */}
            <Card className="relative overflow-hidden border-2 border-amber-300 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 p-6 space-y-6 dark:border-amber-700 dark:from-amber-950/20 dark:to-yellow-950/20">
              <div className="absolute -right-4 -top-4">
                <Crown className="h-16 w-16 text-amber-300 opacity-20" />
              </div>

              <div className="relative space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 px-3 py-1 text-sm font-semibold text-white">
                  <Crown className="h-4 w-4" />
                  {t("comparison.member.badge")}
                </div>
                <h3 className="text-xl font-semibold">{t("comparison.member.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("comparison.member.subtitle")}</p>
              </div>

              <ul className="space-y-3">
                {memberFeatureKeys.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-amber-500 p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">
                      {t(key)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <Card className="bg-gradient-to-br from-amber-500 to-yellow-600 p-8 text-center text-white sm:p-12">
            <div className="space-y-6">
              <Crown className="mx-auto h-16 w-16" />
              <h2 className="text-3xl font-bold sm:text-4xl">{t("cta.title")}</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">{t("cta.subtitle")}</p>

              <div className="flex flex-col items-center gap-4 pt-4">
                <Button size="lg" variant="secondary" className="bg-white text-amber-600 hover:bg-gray-100 text-lg px-8 py-6">
                  {user ? t("cta.activate") : t("cta.join")}
                </Button>
                <p className="text-sm opacity-75">{t("cta.trial-info")}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("faq.title")}
            </h2>
          </div>

          <div className="space-y-4">
            {faqKeys.map((key) => (
              <Card key={key} className="p-6">
                <h3 className="font-semibold mb-2">{t(`faq.questions.${key}.question`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`faq.questions.${key}.answer`)}
                </p>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">{t("faq.more-questions")}</p>
            <Button variant="outline" asChild>
              <LocalizedLink href={paths.staticPages.contact.asPath()}>
                {t("faq.contact-us")}
              </LocalizedLink>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
