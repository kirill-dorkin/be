import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export function PaymentSection({ children }: { children?: ReactNode }) {
  const t = useTranslations("payment");

  return (
    <section className="border-border/60 bg-card rounded-xl border p-5 shadow-sm">
      <div className="space-y-4">
        <h3 className="text-foreground text-lg font-semibold sm:text-xl">
          {t("title")}
        </h3>
        {children ? (
          children
        ) : (
          <p className="text-muted-foreground text-sm">
            {t("select-payment-method")}
          </p>
        )}
      </div>
    </section>
  );
}
