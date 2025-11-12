"use client";

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
  const navLinks = useMemo<{
    href: string;
    title: TranslationMessage;
  }[]>(() => [
    { title: "account.order-history", href: paths.account.orders.asPath() },
    { title: "account.addresses", href: paths.account.addresses.asPath() },
    { title: "account.personal-data", href: paths.account.profile.asPath() },
    {
      title: "account.privacy-settings",
      href: paths.account.privacySettings.asPath(),
    },
    {
      title: "payment.payment-methods",
      href: paths.account.paymentMethods.asPath(),
    },
  ], []);

  // Мемоизация обработчика logout
  const handleLogout = useCallback(async () => {
    await logout();
  }, []);

  return (
    <ul className="no-scrollbar flex gap-x-1 overflow-auto whitespace-nowrap py-3 md:flex-col md:gap-x-0 md:gap-y-0.5 md:whitespace-normal md:py-0">
      {navLinks.map((link) => (
        <li key={link.title}>
          <Button
            asChild
            variant="ghost"
            className={cn(
              pathname === link.href && "bg-accent rounded-md",
              "text-slate-700 dark:text-primary w-full justify-start px-4 py-2 text-sm font-medium md:px-2 md:py-1.5 md:font-normal",
            )}
          >
            <LocalizedLink href={link.href}>{t(link.title)}</LocalizedLink>
          </Button>
        </li>
      ))}
      <li>
        <Button
          onClick={handleLogout}
          className="text-slate-700 dark:text-primary w-full justify-start px-4 py-2 text-sm font-medium md:my-4 md:px-2 md:py-1.5 md:font-normal"
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
