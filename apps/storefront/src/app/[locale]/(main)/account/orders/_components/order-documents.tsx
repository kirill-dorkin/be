import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { Order } from "@nimara/domain/objects/Order";
import { Badge } from "@nimara/ui/components/badge";
import { Button } from "@nimara/ui/components/button";

import { getLocalizedFormatter } from "@/lib/formatters/get-localized-formatter";

export const OrderDocuments = async ({ order }: { order: Order }) => {
  const [t, formatter] = await Promise.all([
    getTranslations(),
    getLocalizedFormatter(),
  ]);

  const invoices = order.invoices ?? [];

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/40 p-6 text-sm text-muted-foreground">
        {t("order.documents.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => {
        const formattedDate = formatter.date({
          date: invoice.createdAt,
          options: {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          },
        });

        return (
          <div
            key={invoice.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-background p-4 shadow-sm"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {invoice.number ?? t("order.documents.fallback")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("order.documents.created", { date: formattedDate })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs uppercase tracking-wide">
                {t(`order.documents.status.${invoice.status}`)}
              </Badge>
              {invoice.url ? (
                <Button asChild size="sm" variant="outline">
                  <a
                    href={invoice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t("order.documents.download")}
                  </a>
                </Button>
              ) : (
                <span className="text-muted-foreground text-xs">
                  {t("order.documents.pending")}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
