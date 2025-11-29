import { Clock, ClipboardCheck, ShieldCheck, Truck, Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

const cards = [
  {
    icon: Wrench,
    title: "Диагностика и ремонт",
    desc: "Ремонтируем технику, смартфоны, ноутбуки, бытовую электронику.",
  },
  {
    icon: Clock,
    title: "Быстрые сроки",
    desc: "Диагностика в день обращения, прозрачные сроки и стоимость.",
  },
  {
    icon: ShieldCheck,
    title: "Гарантия",
    desc: "Гарантия на работы и использованные запчасти.",
  },
  {
    icon: Truck,
    title: "Забор и доставка",
    desc: "Можем забрать устройство и вернуть после ремонта.",
  },
  {
    icon: ClipboardCheck,
    title: "Статус онлайн",
    desc: "Отслеживайте этапы ремонта в личном кабинете.",
  },
];

export async function RepairFocus() {
  const t = await getTranslations("home");

  return (
    <section className="w-full bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-600">
              Сервисный центр
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("features.repair.title")}
            </h2>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">
              Отремонтируем и обслужим технику: точная диагностика, гарантия на работы, удобный сервис.
            </p>
          </div>
          <LocalizedLink
            href={paths.services.asPath()}
            className="text-sm font-semibold text-primary underline-offset-4 transition hover:underline"
          >
            Перейти к услугам
          </LocalizedLink>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
