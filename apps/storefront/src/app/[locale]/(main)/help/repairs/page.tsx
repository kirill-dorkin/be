import {
  BadgeCheck,
  MapPinned,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Badge } from "@nimara/ui/components/badge";
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
  const t = await getTranslations({
    locale,
    namespace: "help.repairs.meta",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const MAP_EMBED_SRC =
  "https://maps.google.com/maps?q=%D0%9A%D1%83%D0%BB%D0%B0%D1%82%D0%BE%D0%B2%D0%B0%208%20%D0%91%D0%B8%D1%88%D0%BA%D0%B5%D0%BA&output=embed";

export default async function HelpRepairsPage(props: PageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "help.repairs" });

  const steps = t.raw("process.items") as string[];
  const services = t.raw("services.items") as string[];

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t("hero.badge")}
          </Badge>
          <span className="text-muted-foreground">
            {t("hero.subtitle")}
          </span>
        </div>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          {t("hero.description")}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="border border-border/70">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wrench className="h-5 w-5 text-primary" />
              {t("process.title")}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {t("process.subtitle")}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ol className="list-decimal space-y-2 pl-5">
              {steps.map((item) => (
                <li key={item} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ol>
            <LocalizedLink
              href={paths.services.asPath()}
              className="text-primary font-semibold underline-offset-4 hover:underline"
            >
              {t("process.cta")}
            </LocalizedLink>
          </CardContent>
        </Card>

        <Card className="border border-border/70">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BadgeCheck className="h-5 w-5 text-primary" />
              {t("services.title")}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {t("services.subtitle")}
            </p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-1.5">
              {services.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <LocalizedLink
              href={paths.services.detail.asPath({ slug: "diagnostika-kompyutera" })}
              className="text-primary font-semibold underline-offset-4 hover:underline"
            >
              {t("services.cta")}
            </LocalizedLink>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("discount.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t("discount.description")}</p>
            <ul className="space-y-2">
              {(t.raw("discount.items") as string[]).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <LocalizedLink
              href={paths.help.orders.asPath()}
              className="text-primary font-semibold underline-offset-4 hover:underline"
            >
              {t("discount.cta")}
            </LocalizedLink>
          </CardContent>
        </Card>
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPinned className="h-5 w-5 text-primary" />
              {t("location.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              {t("location.description")}
            </p>
            <div className="aspect-video overflow-hidden rounded-xl border border-border/80">
              <iframe
                title={t("location.mapTitle")}
                src={MAP_EMBED_SRC}
                loading="lazy"
                className="h-full w-full"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <a
                href="https://maps.google.com/maps?q=%D0%9A%D1%83%D0%BB%D0%B0%D1%82%D0%BE%D0%B2%D0%B0%208%2F1%20%D0%91%D0%B8%D1%88%D0%BA%D0%B5%D0%BA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold underline-offset-4 hover:underline"
              >
                {t("location.actions.google")}
              </a>
              <a
                href="https://2gis.kg/bishkek/search/%D0%9A%D1%83%D0%BB%D0%B0%D1%82%D0%BE%D0%B2%D0%B0%208%20%D0%B1%D0%B8%D1%88%D0%BA%D0%B5%D0%BA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold underline-offset-4 hover:underline"
              >
                {t("location.actions.twoGis")}
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
