import { getTranslations } from "next-intl/server";

import { WorkerApplyForm } from "./form";

export default async function StaffApplyPage() {
  const t = await getTranslations("staff-apply");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center">
        <span className="text-primary inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          {t("badge")}
        </span>
        <h1 className="text-foreground text-3xl font-semibold sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("subtitle")}
        </p>
      </div>

      <div className="rounded-2xl border border-border/40 bg-background p-6 shadow-sm lg:p-8">
        <WorkerApplyForm />
      </div>

      <p className="text-muted-foreground text-xs text-center">
        {t("disclaimer")}
      </p>
    </div>
  );
}
