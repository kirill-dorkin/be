import { getTranslations } from "next-intl/server";

import { WorkerApplyForm } from "./form";

export default async function StaffApplyPage() {
  const t = await getTranslations("staff-apply");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-12">
      <div className="space-y-3 text-center">
        <span className="text-primary inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest">
          {t("badge")}
        </span>
        <h1 className="text-foreground text-3xl font-semibold">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="rounded-2xl border border-border/40 bg-background p-6 shadow-sm">
        <WorkerApplyForm />
      </div>

      <p className="text-muted-foreground text-xs text-center">
        {t("disclaimer")}
      </p>
    </div>
  );
}
