import { ClipboardList, CreditCard, ShoppingCart } from "lucide-react";
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

export async function generateMetadata(_props: PageProps): Promise<Metadata> {
  const { locale } = await _props.params;
  const t = await getTranslations({
    locale,
    namespace: "help.orders.meta",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function HelpOrdersPage(props: PageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "help.orders" });

  const sections = [
    {
      icon: ShoppingCart,
      title: t("sections.selection.title"),
      description: t("sections.selection.description"),
      items: t.raw("sections.selection.items") as string[],
    },
    {
      icon: CreditCard,
      title: t("sections.payment.title"),
      description: t("sections.payment.description"),
      items: t.raw("sections.payment.items") as string[],
    },
    {
      icon: ClipboardList,
      title: t("sections.account.title"),
      description: t("sections.account.description"),
      items: t.raw("sections.account.items") as string[],
    },
  ];

  const nextSteps = t.raw("nextSteps.items") as string[];

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
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Card key={section.title} className="border-border/70 h-full">
              <CardHeader className="space-y-4">
                <span className="bg-primary/10 text-primary inline-flex h-12 w-12 items-center justify-center rounded-full">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <CardTitle className="text-xl">{section.title}</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {section.description}
                </p>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm">
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="leading-relaxed">
                      • {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="border-primary/20 bg-primary/5 space-y-4 rounded-2xl border p-6">
        <h2 className="text-primary text-xl font-semibold">
          {t("nextSteps.title")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("nextSteps.description")}
        </p>
        <ul className="text-muted-foreground space-y-2 text-sm">
          {nextSteps.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3 pt-2">
          <LocalizedLink
            href={paths.cart.asPath()}
            className="text-primary text-sm font-semibold underline-offset-4 hover:underline"
          >
            {t("nextSteps.ctaCart")}
          </LocalizedLink>
          <LocalizedLink
            href={paths.help.delivery.asPath()}
            className="text-primary text-sm font-semibold underline-offset-4 hover:underline"
          >
            {t("nextSteps.ctaDelivery")}
          </LocalizedLink>
        </div>
      </section>
    </>
  );
}
