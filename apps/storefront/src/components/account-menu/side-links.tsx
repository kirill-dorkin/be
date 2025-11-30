"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";

import { Button } from "@nimara/ui/components/button";
import { cn } from "@nimara/ui/lib/utils";

import { LocalizedLink, usePathname } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { type TranslationMessage } from "@/types";

import { logout } from "./actions";

function SideLinksComponent() {
  const t = useTranslations();
  const pathname = usePathname();

  // Мемоизация навигационных ссылок
  const navLinks = useMemo(() => accountNavLinks, []);

  // Мемоизация обработчика logout
  const handleLogout = useCallback(async () => {
    await logout();
  }, []);

  return (
    <ul className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto whitespace-nowrap pb-1 pt-1 [scrollbar-width:none] sm:[scrollbar-width:auto] md:snap-none md:flex-col md:gap-1 md:whitespace-normal md:p-0">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <li key={link.title} className="snap-start md:snap-none">
            <Button
              asChild
              variant="ghost"
              className={cn(
                "w-full min-w-[180px] justify-start rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 sm:min-w-[220px] md:min-w-0 md:px-3",
                isActive
                  ? "bg-primary/10 text-primary ring-primary/10 dark:bg-primary/20 shadow-sm ring-1"
                  : "dark:text-muted-foreground dark:hover:text-primary text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/60",
              )}
            >
              <LocalizedLink
                href={link.href}
                className="flex w-full items-center justify-between gap-3"
              >
                <span>{t(link.title)}</span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-all",
                    isActive
                      ? "translate-x-0 opacity-100"
                      : "translate-x-1 opacity-60",
                  )}
                  aria-hidden="true"
                />
              </LocalizedLink>
            </Button>
          </li>
        );
      })}
      <li className="pt-1 md:pt-3">
        <Button
          onClick={handleLogout}
          className="w-full justify-start rounded-2xl px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-600 md:px-3 dark:text-rose-400 dark:hover:bg-rose-500/10"
          variant="ghost"
        >
          {t("auth.log-out")}
        </Button>
      </li>
    </ul>
  );
}

// Мемоизация - используется на всех страницах аккаунта
export const SideLinks = memo(SideLinksComponent);

export const accountNavLinks: { href: string; title: TranslationMessage }[] = [
  { title: "account.order-history", href: paths.account.orders.asPath() },
  { title: "account.addresses", href: paths.account.addresses.asPath() },
  { title: "account.personal-data", href: paths.account.profile.asPath() },
  { title: "referral.title", href: paths.account.referral.asPath() },
  { title: "balance.title", href: paths.account.balance.asPath() },
  {
    title: "account.privacy-settings",
    href: paths.account.privacySettings.asPath(),
  },
  {
    title: "payment.payment-methods",
    href: paths.account.paymentMethods.asPath(),
  },
];
