import {
  Clock,
  type LucideIcon,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
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

import { clientEnvs } from "@/envs/client";
import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import type { SupportedLocale } from "@/regions/types";

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
  const phoneNumber = t("channels.phone.value");
  const phoneHref = t("channels.phone.href");

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
      title: t("channels.support.title"),
      description: t("channels.support.description"),
      value: t("channels.support.value"),
      action: {
        href: paths.help.faq.asPath(),
        label: t("channels.support.cta"),
        localized: true,
      },
    },
  ];

  const supportNote = t.rich("support.note", {
    faqLink: (chunks) => (
      <LocalizedLink
        className="text-primary underline-offset-4 hover:underline"
        href={paths.help.faq.asPath()}
      >
        {chunks}
      </LocalizedLink>
    ),
    emailLink: (chunks) => (
      <a
        className="text-primary underline-offset-4 hover:underline"
        href={`mailto:${email}`}
      >
        {chunks}
      </a>
    ),
  });

  const addressLines = t("visit.address").split("\n");

  return (
    <div className="bg-background">
      <div className="container space-y-12 py-12 lg:space-y-16 lg:py-16">
        <section className="mx-auto max-w-3xl space-y-6 text-center">
          <span className="text-primary inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest">
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
              <a href={`mailto:${email}`}>{t("hero.primaryCta")}</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={`tel:${phoneHref}`}>
                {t("hero.secondaryCta", { phone: phoneNumber })}
              </a>
            </Button>
          </div>
        </section>

        <section aria-labelledby="contact-channels" className="space-y-6">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <h2
              id="contact-channels"
              className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              {t("channels.title")}
            </h2>
            <p className="text-muted-foreground text-base">
              {t("channels.subtitle")}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {channels.map((channel) => {
              const Icon = channel.icon;

              return (
                <Card key={channel.title} className="border-muted/80 h-full">
                  <CardHeader className="space-y-4">
                    <span className="bg-primary/10 text-primary inline-flex h-12 w-12 items-center justify-center rounded-full">
                      <Icon aria-hidden className="h-6 w-6" />
                    </span>
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold">
                        {channel.title}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {channel.description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-foreground text-lg font-semibold">
                      {channel.value}
                    </p>
                    <Button asChild variant="outline">
                      {channel.action.localized ? (
                        <LocalizedLink href={channel.action.href}>
                          {channel.action.label}
                        </LocalizedLink>
                      ) : (
                        <a href={channel.action.href}>{channel.action.label}</a>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Card className="border-muted/80 h-full">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-semibold">
                {t("support.title")}
              </CardTitle>
              <p className="text-muted-foreground text-sm sm:text-base">
                {t("support.subtitle")}
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary inline-flex h-10 w-10 items-center justify-center rounded-full">
                  <Clock aria-hidden className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-foreground font-medium">
                    {t("support.hoursTitle")}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t("support.hoursValue")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary inline-flex h-10 w-10 items-center justify-center rounded-full">
                  <MessageCircle aria-hidden className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-foreground font-medium">
                    {t("support.responseTitle")}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t("support.responseValue")}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">{supportNote}</p>
            </CardContent>
          </Card>

          <Card className="border-muted/80 h-full">
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
              <div className="rounded-2xl border border-dashed border-muted bg-muted/40 p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  {t("visit.mapDescription")}
                </p>
                <Button asChild className="mt-4" variant="ghost">
                  <a
                    href={t("visit.mapLink")}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {t("visit.cta")}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
