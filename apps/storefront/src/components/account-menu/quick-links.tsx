"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { Button } from "@nimara/ui/components/button";

import { LocalizedLink, usePathname } from "@/i18n/routing";

import { logout } from "./actions";
import { accountNavLinks } from "./side-links";

export function AccountQuickLinks() {
  const t = useTranslations();
  const pathname = usePathname();
  const handleLogout = useCallback(async () => {
    await logout();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl lg:hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-slate-900" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white via-white/90 to-transparent dark:from-slate-900" />
      <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-3xl border border-slate-100/70 bg-white/90 px-3 py-2 shadow-sm ring-1 ring-black/5 dark:border-slate-800/80 dark:bg-slate-900/60 dark:ring-white/5">
        {accountNavLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Button
              key={link.title}
              asChild
              size="sm"
              variant="ghost"
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                isActive
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "dark:text-muted-foreground border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700"
              }`}
            >
              <LocalizedLink href={link.href}>{t(link.title)}</LocalizedLink>
            </Button>
          );
        })}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleLogout}
          className="rounded-full border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-500 hover:border-rose-200 hover:bg-rose-50"
        >
          {t("auth.log-out")}
        </Button>
      </div>
    </div>
  );
}
