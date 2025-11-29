import { type LucideIcon, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { clientEnvs } from "@/envs/client";
import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import type { SupportedLocale } from "@/regions/types";

import { ContactMap } from "./contact-map";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export async function generateMetadata(
  _props: PageProps,
): Promise<Metadata> {
  const t = await getTranslations("contact.meta");

  return {
    title: t("title"),
    description: t("description"),
  };
}

type ContactChannel = {
  action: {
    href: string;
    label: string;
    localized?: boolean;
  };
  description: string;
  icon: LucideIcon;
  title: string;
  value: string;
};

export default async function ContactPage() {
  const t = await getTranslations("contact");
  const email = clientEnvs.NEXT_PUBLIC_DEFAULT_EMAIL;
  const phoneNumber = "+996 501 313 114";
  const phoneHref = "+996501313114";
  const whatsappMessage = encodeURIComponent(
    "Здравствуйте! Хочу получить консультацию по ремонту.",
  );
  const whatsappLink = `https://wa.me/996501313114?text=${whatsappMessage}`;

  const channels: ContactChannel[] = [
    {
      icon: Phone,
      title: t("channels.phone.title"),
      description: t("channels.phone.description"),
      value: phoneNumber,
      action: {
        href: `tel:${phoneHref}`,
        label: t("channels.phone.cta"),
      },
    },
    {
      icon: Mail,
      title: t("channels.email.title"),
      description: t("channels.email.description"),
      value: email,
      action: {
        href: `mailto:${email}`,
        label: t("channels.email.cta"),
      },
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Быстро ответим в мессенджере",
      value: phoneNumber,
      action: {
        href: whatsappLink,
        label: "Открыть WhatsApp",
      },
    },
  ];

  const addressLines = ["ул. Кулатова 8/1", "Бишкек, Кыргызстан"];

  return (
    <div className="bg-background">
      <div className="container space-y-12 pb-16 pt-12 lg:space-y-16 lg:pb-24 lg:pt-16">
        <section className="mx-auto max-w-4xl space-y-6 text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t("hero.badge")}
          </span>
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <a href={whatsappLink} target="_blank" rel="noreferrer">
                {t("hero.primaryCta")}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`tel:${phoneHref}`}>
                {t("hero.secondaryCta", { phone: phoneNumber })}
              </a>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)]">
          <Card className="h-full border-border/70 bg-card/80 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-semibold">
                {t("visit.title")}
              </CardTitle>
              <p className="text-muted-foreground text-sm sm:text-base">
                {t("visit.subtitle")}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary inline-flex h-10 w-10 items-center justify-center rounded-full">
                  <MapPin aria-hidden className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-foreground font-medium">
                    {t("visit.addressTitle")}
                  </p>
                  <div className="text-muted-foreground text-sm">
                    {addressLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
              <Card className="border border-border/60 bg-card shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <ContactMapContainer />
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <a href="https://go.2gis.com/eNlWq" rel="noreferrer" target="_blank">
                      Открыть в 2ГИС
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
