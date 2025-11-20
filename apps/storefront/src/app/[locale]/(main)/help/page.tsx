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
      <section className="space-y-5 rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm sm:space-y-6 sm:rounded-3xl sm:p-10 lg:p-12">
        <span className="text-primary inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] sm:px-4 sm:text-xs sm:tracking-[0.35em]">
          {t("hero.badge")}
        </span>

        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-foreground text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed sm:text-base lg:text-lg">
            {t("hero.subtitle")}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <LocalizedLink href={paths.help.orders.asPath()}>
              {t("hero.primaryCta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </LocalizedLink>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <LocalizedLink href={paths.staticPages.contact.asPath()}>
              {t("hero.secondaryCta")}
            </LocalizedLink>
          </Button>
        </div>
      </section>

      <section className="space-y-5 sm:space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-foreground text-xl font-semibold leading-tight sm:text-2xl lg:text-3xl">
            {t("shortcuts.title")}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
            {t("shortcuts.subtitle")}
          </p>
        </div>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Card
                key={link.href}
                className="group border border-border/60 bg-card shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
              >
                <LocalizedLink
                  href={link.href}
                  className="flex h-full flex-col p-5 text-left sm:p-6"
                >
                  <span className="bg-primary/10 text-primary inline-flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
                  </span>
                  <CardHeader className="px-0 pb-2 pt-4 sm:pt-5">
                    <CardTitle className="text-lg font-semibold leading-tight sm:text-xl">
                      {link.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 text-muted-foreground text-sm leading-relaxed">
                    {link.description}
                  </CardContent>
                </LocalizedLink>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
        <Card className="border border-border/70 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="flex items-center gap-2.5 text-lg font-semibold sm:text-xl">
              <LifeBuoy className="h-5 w-5 flex-shrink-0 text-primary" />
              {t("support.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>{t("support.description")}</p>
            <ul className="space-y-2.5">
              {supportItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-primary mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="secondary" size="default" className="w-full sm:w-auto">
              <LocalizedLink href={paths.help.faq.asPath()}>
                {t("support.cta")}
              </LocalizedLink>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="flex items-center gap-2.5 text-lg font-semibold sm:text-xl">
              <MapPin className="h-5 w-5 flex-shrink-0 text-primary" />
              {t("visit.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>{t("visit.description")}</p>
            <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-foreground text-sm font-medium">
              {t("visit.address")
                .split("\n")
                .map((line) => (
                  <div key={line}>{line}</div>
                ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild variant="outline" size="default" className="w-full sm:w-auto sm:flex-1">
                <a
                  href="https://maps.google.com/maps?q=Кулатова%208%2F1%20Бишкек&output=classic"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("visit.actions.google")}
                </a>
              </Button>
              <Button asChild variant="outline" size="default" className="w-full sm:w-auto sm:flex-1">
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
