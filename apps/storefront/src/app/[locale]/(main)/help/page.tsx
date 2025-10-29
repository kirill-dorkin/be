import {
  ArrowRight,
  LifeBuoy,
  MapPin,
  PackageSearch,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import type { SupportedLocale } from "@/regions/types";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export async function generateMetadata(
  _props: PageProps,
): Promise<Metadata> {
  const { locale } = await _props.params;
  const t = await getTranslations({ locale, namespace: "help.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function HelpOverviewPage(props: PageProps) {
  const { locale } = await props.params;
  const [t, navT] = await Promise.all([
    getTranslations({ locale, namespace: "help.overview" }),
    getTranslations({ locale, namespace: "help.nav" }),
  ]);

  const quickLinks = [
    {
      href: paths.help.orders.asPath(),
      icon: LifeBuoy,
      title: navT("orders"),
      description: t("shortcuts.orders"),
    },
    {
      href: paths.help.delivery.asPath(),
      icon: PackageSearch,
      title: navT("delivery"),
      description: t("shortcuts.delivery"),
    },
    {
      href: paths.help.repairs.asPath(),
      icon: ShieldCheck,
      title: navT("repairs"),
      description: t("shortcuts.repairs"),
    },
  ];

  const supportItems = t.raw("support.items") as string[];

  return (
    <>
      <section className="space-y-6 rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-background to-background p-8 text-center shadow-sm sm:p-12">
        <span className="text-primary inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]">
          {t("hero.badge")}
        </span>
        <div className="space-y-4">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg">
            {t("hero.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <LocalizedLink href={paths.help.orders.asPath()}>
              {t("hero.primaryCta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </LocalizedLink>
          </Button>
          <Button asChild size="lg" variant="outline">
            <LocalizedLink href={paths.staticPages.contact.asPath()}>
              {t("hero.secondaryCta")}
            </LocalizedLink>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-foreground text-2xl font-semibold sm:text-3xl">
            {t("shortcuts.title")}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-sm sm:text-base">
            {t("shortcuts.subtitle")}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Card
                key={link.href}
                className="group border border-border/60 transition hover:border-primary/40 hover:shadow-md"
              >
                <LocalizedLink
                  href={link.href}
                  className="flex h-full flex-col p-6 text-left"
                >
                  <span className="bg-primary/10 text-primary inline-flex h-12 w-12 items-center justify-center rounded-full transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <CardHeader className="px-0 pb-2 pt-5">
                    <CardTitle className="text-xl font-semibold">
                      {link.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 text-muted-foreground text-sm">
                    {link.description}
                  </CardContent>
                </LocalizedLink>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LifeBuoy className="h-5 w-5 text-primary" />
              {t("support.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground text-sm">
            <p>{t("support.description")}</p>
            <ul className="space-y-2">
              {supportItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <Button asChild variant="secondary" size="sm">
              <LocalizedLink href={paths.help.faq.asPath()}>
                {t("support.cta")}
              </LocalizedLink>
            </Button>
          </CardContent>
        </Card>
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              {t("visit.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground text-sm">
            <p>{t("visit.description")}</p>
            <div className="space-y-1 text-foreground text-sm font-medium">
              {t("visit.address")
                .split("\n")
                .map((line) => (
                  <div key={line}>{line}</div>
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a
                  href="https://maps.google.com/maps?q=Кулатова%208%2F1%20Бишкек&output=classic"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("visit.actions.google")}
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href="https://2gis.kg/bishkek/search/%D0%9A%D1%83%D0%BB%D0%B0%D1%82%D0%BE%D0%B2%D0%B0%208%2F1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("visit.actions.twoGis")}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
