import {
  Headset,
  PiggyBank,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { TranslationMessage } from "@/types";

const FEATURE_ORDER = [
  { key: "support", icon: Headset },
  { key: "delivery", icon: Truck },
  { key: "warranty", icon: ShieldCheck },
  { key: "savings", icon: PiggyBank },
] as const;

type FeatureKey = (typeof FEATURE_ORDER)[number]["key"];

const getItemMessageKey = <Field extends "title" | "description">(
  key: FeatureKey,
  field: Field,
): TranslationMessage<"home.highlights"> =>
  `items.${key}.${field}` as TranslationMessage<"home.highlights">;

export const HomeHighlights = async () => {
  const t = await getTranslations("home.highlights");

  return (
    <section className="relative mb-14 w-full px-4 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="absolute inset-x-6 top-6 hidden h-40 rounded-full bg-gradient-to-r from-amber-200/40 via-orange-100/30 to-sky-200/40 blur-3xl dark:from-amber-500/15 dark:via-amber-400/10 dark:to-sky-500/15 sm:block"
      />
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-orange-50 via-white to-sky-50 p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-neutral-950 dark:from-neutral-950 dark:via-neutral-950/95 dark:to-neutral-900 lg:p-12">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
            {t("eyebrow")}
          </span>
          <h2 className="text-3xl font-semibold leading-tight hyphens-auto break-words text-neutral-900 dark:text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-base text-neutral-600 hyphens-auto break-words dark:text-white/70">
            {t("subtitle")}
          </p>
        </div>
        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 lg:gap-6">
          {FEATURE_ORDER.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="group flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_28px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200 group-hover:text-amber-700 dark:bg-amber-400/20 dark:text-amber-200 dark:group-hover:bg-amber-400/30">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold hyphens-auto break-words text-neutral-900 dark:text-white">
                    {t(getItemMessageKey(key, "title"))}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 hyphens-auto break-words dark:text-white/70">
                    {t(getItemMessageKey(key, "description"))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
