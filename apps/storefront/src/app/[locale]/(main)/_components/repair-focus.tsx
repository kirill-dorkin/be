import {
  ClipboardCheck,
  Clock,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

const cards = [
  {
    icon: Wrench,
    key: "diagnostics",
  },
  {
    icon: Clock,
    key: "speed",
  },
  {
    icon: ShieldCheck,
    key: "warranty",
  },
  {
    icon: Truck,
    key: "delivery",
  },
  {
    icon: ClipboardCheck,
    key: "tracking",
  },
] as const;

const cardTitleKeyMap = {
  diagnostics: "repairFocus.cards.diagnostics.title",
  speed: "repairFocus.cards.speed.title",
  warranty: "repairFocus.cards.warranty.title",
  delivery: "repairFocus.cards.delivery.title",
  tracking: "repairFocus.cards.tracking.title",
} as const;

const cardDescriptionKeyMap = {
  diagnostics: "repairFocus.cards.diagnostics.description",
  speed: "repairFocus.cards.speed.description",
  warranty: "repairFocus.cards.warranty.description",
  delivery: "repairFocus.cards.delivery.description",
  tracking: "repairFocus.cards.tracking.description",
} as const;

export async function RepairFocus() {
  const t = await getTranslations("home");

  return (
    <section className="bg-background w-full py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-600">
              {t("repairFocus.overline")}
            </p>
            <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              {t("repairFocus.title")}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-base">
              {t("repairFocus.subtitle")}
            </p>
          </div>
          <LocalizedLink
            href={paths.services.asPath()}
            className="text-primary text-sm font-semibold underline-offset-4 transition hover:underline"
          >
            {t("repairFocus.cta")}
          </LocalizedLink>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.key}
              className="border-border/60 bg-card/70 group rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="text-foreground text-lg font-semibold">
                {t(cardTitleKeyMap[card.key])}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                {t(cardDescriptionKeyMap[card.key])}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
