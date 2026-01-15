import {
  ClipboardList,
  type LucideIcon,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

const steps = [
  {
    icon: ClipboardList,
    key: "request",
  },
  {
    icon: Wrench,
    key: "repair",
  },
  {
    icon: ShieldCheck,
    key: "quality",
  },
  {
    icon: Truck,
    key: "delivery",
  },
] as const satisfies ReadonlyArray<{ icon: LucideIcon; key: string }>;

export const RepairProcess = async () => {
  const t = await getTranslations("home");

  return (
    <section className="bg-muted/8 sm:py-18 w-full py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-600">
              {t("repairProcess.overline")}
            </p>
            <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              {t("repairProcess.title")}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-base">
              {t("repairProcess.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const titleKey = `repairProcess.steps.${step.key}.title` as const;
            const descriptionKey =
              `repairProcess.steps.${step.key}.description` as const;

            return (
              <div
                key={step.key}
                className="border-border/60 bg-card/70 group rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="bg-primary/10 text-primary ring-primary/15 mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="text-foreground text-lg font-semibold">
                  {t(titleKey)}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {t(descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
