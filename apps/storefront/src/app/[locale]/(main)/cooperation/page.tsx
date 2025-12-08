import {
  CheckCircle2,
  Gift,
  FileDown,
  ShieldCheck,
  Sparkles,
  Gauge,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Badge } from "@nimara/ui/components/badge";
import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import type { SupportedLocale } from "@/regions/types";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

type Highlight = {
  bullets: string[];
  description: string;
  title: string;
};

type Feature = {
  bullets: string[];
  title: string;
};

type TimelineStep = {
  description: string;
  title: string;
};

type DownloadCopy = {
  badge: string;
  cta: string;
  description: string;
  secondary: string;
  size: string;
  title: string;
};

export async function generateMetadata(_props: PageProps): Promise<Metadata> {
  const t = await getTranslations("cooperation.meta");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CooperationPage() {
  const t = await getTranslations("cooperation");

  const heroPoints = t.raw("heroPoints") as string[];
  const highlights = t.raw("highlights.items") as Highlight[];
  const features = t.raw("features.items") as Feature[];
  const economics = t.raw("economics.items") as string[];
  const timeline = t.raw("timeline.items") as TimelineStep[];
  const specialOffers = t.raw("offer.special") as string[];
  const downloadCopy = t.raw("download") as DownloadCopy;

  const primaryPhoneDisplay = "+996 557 313 114";
  const primaryPhoneHref = "+996557313114";
  const secondaryPhoneDisplay = "+996 708 804 070";
  const whatsappMessage = encodeURIComponent(t("whatsappMessage"));
  const whatsappLink = `https://wa.me/996501313114?text=${whatsappMessage}`;
  const email = "bestelectronicskg@gmail.com";
  const siteLink = "https://be-kg.vercel.app/";
  const contractUrl = "/best-electronics-cooperation.docx";

  const highlightIcons = [ShieldCheck, Sparkles, Gauge] as const;

  return (
    <div className="bg-background">
      <section className="bg-background">
        <div className="container relative space-y-8 pb-16 pt-14 lg:pb-20 lg:pt-20">
          <Badge
            variant="outline"
            className="text-primary border-primary/30 bg-white/80"
          >
            {t("hero.badge")}
          </Badge>

          <div className="space-y-4">
            <h1 className="text-foreground text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="text-muted-foreground max-w-3xl text-base leading-relaxed sm:text-lg">
              {t("hero.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="shadow-sm">
              <a href={whatsappLink} target="_blank" rel="noreferrer">
                {t("hero.primaryCta")}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="shadow-sm">
              <a href={contractUrl} download>
                <FileDown className="mr-2 h-4 w-4" aria-hidden />
                {downloadCopy.cta}
              </a>
            </Button>
          </div>

          <ul className="text-muted-foreground grid max-w-3xl gap-2 text-left text-sm sm:text-base">
            {heroPoints.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container space-y-8 py-12 sm:space-y-10 sm:py-14 lg:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-foreground text-2xl font-semibold sm:text-3xl">
              {t("highlights.title")}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t("hero.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, index) => {
            const Icon = highlightIcons[index] ?? CheckCircle2;

            return (
              <Card
                key={item.title}
                className="border-border/70 bg-card/80 shadow-sm"
              >
                <CardHeader className="space-y-3">
                  <div className="text-primary flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-white shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    {item.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <ul className="space-y-1.5">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container space-y-8 pb-12 sm:space-y-10 sm:pb-14 lg:pb-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-foreground text-2xl font-semibold sm:text-3xl">
              {t("features.title")}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t("economics.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/70 bg-card/80 shadow-sm"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ul className="space-y-1.5">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container grid gap-8 pb-12 sm:gap-10 sm:pb-14 lg:grid-cols-[1.1fr,0.9fr] lg:pb-20">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold sm:text-3xl">
              {t("economics.title")}
            </CardTitle>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t("economics.subtitle")}
            </p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="space-y-1.5">
              {economics.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold sm:text-3xl">
              {t("timeline.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <ol className="space-y-5">
                {timeline.map((step, index) => {
                  const isLast = index === timeline.length - 1;

                  return (
                    <li key={step.title} className="relative flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <span className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold shadow-sm">
                          {index + 1}
                        </span>
                        {!isLast && (
                          <span
                            aria-hidden
                            className="bg-border/60 mt-1 w-px flex-1"
                          />
                        )}
                      </div>
                      <div className="border-border/70 bg-white rounded-lg border px-4 py-3 shadow-sm flex-1">
                        <p className="text-foreground font-semibold">
                          {step.title}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container pb-16">
        <Card className="border-border/70 bg-white shadow-sm">
          <CardContent className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-foreground text-lg font-semibold">
                {downloadCopy.title}
              </p>
              <p className="text-muted-foreground text-sm">
                {downloadCopy.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild>
                <a href={contractUrl} download>
                  <FileDown className="mr-2 h-4 w-4" aria-hidden />
                  {downloadCopy.cta}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
