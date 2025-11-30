import { type ReactNode } from "react";

import { AccountSideMenu } from "@/components/account-menu";
import { AccountQuickLinks } from "@/components/account-menu/quick-links";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <section className="w-full bg-gradient-to-b from-slate-50/50 via-white to-white dark:from-slate-900 dark:via-slate-950/70">
      <div className="container space-y-4 px-4 pb-8 pt-4 sm:px-4 sm:pt-8 md:pb-16">
        <AccountQuickLinks />
        <div className="dark:text-primary mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-slate-100/80 bg-white/95 px-4 py-5 text-slate-700 shadow-lg ring-1 ring-black/5 sm:rounded-[28px] sm:px-6 sm:py-6 md:px-10 md:py-10 dark:border-slate-900/60 dark:bg-slate-900/70 dark:ring-white/5">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[300px_minmax(0,1fr)]">
            <div className="hidden lg:block lg:pr-4">
              <AccountSideMenu />
            </div>
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
