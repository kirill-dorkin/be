import { getTranslations } from "next-intl/server";

import { DeleteAccountModal } from "./modal";

export default async function Page() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-8 text-sm">
      <h2 className="dark:text-primary text-2xl text-slate-700">
        {t("account.privacy-settings")}
      </h2>
      <hr />
      <div className="flex flex-col gap-6 rounded-2xl border border-slate-100/80 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/40">
        <div className="space-y-1 sm:max-w-xl">
          <h3 className="dark:text-primary font-medium text-slate-700">
            {t("account.delete-account-and-all-your-data-permanently")}
          </h3>
          <p className="dark:text-muted-foreground text-stone-500">
            {t("account.delete-account-description")}
          </p>
        </div>
        <div className="flex justify-start sm:justify-end">
          <DeleteAccountModal />
        </div>
      </div>
    </div>
  );
}
