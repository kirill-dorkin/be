import { PhoneCall } from "lucide-react";

import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const ServiceCta = () => {
  const contactHref = paths.contact?.asPath ? paths.contact.asPath() : "/contact";

  return (
    <section className="w-full bg-background py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-card/70 px-6 py-6 shadow-sm sm:px-8 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
                Сервис 7 дней в неделю
              </p>
              <h3 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                Нужна помощь с техникой? Оставьте заявку на ремонт
              </h3>
              <p className="text-sm text-muted-foreground">
                Быстрая диагностика, прозрачные цены и гарантия на работы.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="bg-amber-500 text-white shadow-sm hover:bg-amber-600"
              >
                <LocalizedLink href={paths.services.asPath()}>Перейти к услугам</LocalizedLink>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <LocalizedLink href={contactHref}>
                  <PhoneCall className="h-5 w-5" />
                  Позвонить нам
                </LocalizedLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
