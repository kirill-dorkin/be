import { getTranslations } from "next-intl/server";

import { SideLinks } from "./side-links";

export async function AccountSideMenu() {
  const t = await getTranslations();

  return (
    <aside className="lg:sticky lg:top-6">
      <nav
        aria-label={t("account.personal-data")}
        className="rounded-3xl border border-slate-100/90 bg-white/90 p-2 shadow-sm ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900/60 dark:ring-white/5"
      >
        <SideLinks />
      </nav>
    </aside>
  );
}
