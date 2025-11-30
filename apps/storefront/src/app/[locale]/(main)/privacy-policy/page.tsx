import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { type SupportedLocale } from "@/regions/types";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return {
    title: t("static-pages.privacy-policy"),
    description: t("static-pages.privacy.description"),
  };
}

export default async function PrivacyPolicyPage(props: PageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });
  const sections = t.raw("static-pages.privacy.sections") as Array<{
    items: string[];
    title: string;
  }>;

  return (
    <div className="container py-8 sm:py-12 lg:py-16">
      <header className="space-y-3 text-center sm:space-y-4">
        <span className="text-primary bg-primary/10 inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          {t("static-pages.privacy-policy")}
        </span>
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          {t("static-pages.privacy.title")}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-sm leading-relaxed sm:text-base">
          {t("static-pages.privacy.subtitle")}
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <Card
            key={section.title}
            className="border-border/70 bg-card border shadow-sm"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-lg font-semibold sm:text-xl">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm leading-relaxed sm:text-base">
              <ul className="list-disc space-y-1 pl-5">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
