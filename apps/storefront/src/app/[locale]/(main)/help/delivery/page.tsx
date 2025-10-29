import { Clock, PackageCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

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
    namespace: "help.delivery.meta",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function HelpDeliveryPage(props: PageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "help.delivery" });

  const deliveryOptions = [
    {
      icon: Truck,
      title: t("options.courier.title"),
      description: t("options.courier.description"),
      bullets: t.raw("options.courier.items") as string[],
    },
    {
      icon: PackageCheck,
      title: t("options.pickup.title"),
      description: t("options.pickup.description"),
      bullets: t.raw("options.pickup.items") as string[],
    },
    {
      icon: Clock,
      title: t("options.status.title"),
      description: t("options.status.description"),
      bullets: t.raw("options.status.items") as string[],
    },
  ];

  const preparationList = t.raw("preparation.items") as string[];
  const faqList = t.raw("faq.items") as string[];

  return (
    <>
      <section className="space-y-4">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          {t("hero.subtitle")}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {deliveryOptions.map((option) => {
          const Icon = option.icon;

          return (
            <Card key={option.title} className="h-full border-border/70">
              <CardHeader className="space-y-4">
                <span className="bg-primary/10 text-primary inline-flex h-12 w-12 items-center justify-center rounded-full">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {option.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {option.bullets.map((bullet) => (
                  <p key={bullet}>• {bullet}</p>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle className="text-xl">{t("preparation.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t("preparation.description")}</p>
            <ul className="space-y-2">
              {preparationList.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle className="text-xl">{t("faq.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="space-y-2">
              {faqList.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <LocalizedLink
              href={paths.help.faq.asPath()}
              className="text-primary font-semibold underline-offset-4 hover:underline"
            >
              {t("faq.cta")}
            </LocalizedLink>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
