import { PhoneCall } from "lucide-react";

import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const ServiceCta = () => {
  return (
    <section className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-12 text-white shadow-inner">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Сервис 7 дней в неделю
          </p>
          <h3 className="text-2xl font-bold leading-tight sm:text-3xl">
            Нужна помощь с техникой? Оставьте заявку на ремонт
          </h3>
          <p className="text-sm text-white/90">
            Быстрая диагностика, прозрачные цены и гарантия на работы.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            asChild
            size="lg"
            className="bg-white text-amber-700 hover:bg-white/90 hover:text-amber-800"
          >
            <LocalizedLink href={paths.services.asPath()}>Перейти к услугам</LocalizedLink>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="gap-2 text-white hover:bg-white/10"
          >
            <LocalizedLink href={paths.contact.asPath()}>
              <PhoneCall className="h-5 w-5" />
              Позвонить нам
            </LocalizedLink>
          </Button>
        </div>
      </div>
    </section>
  );
};
