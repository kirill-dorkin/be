import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export function PaymentSection({ children }: { children?: ReactNode }) {
  const t = useTranslations("payment");

  return (
    <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground sm:text-xl">{t("title")}</h3>
        {children}
      </div>
    </section>
  );
}
