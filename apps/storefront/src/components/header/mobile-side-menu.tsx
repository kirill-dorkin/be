"use client";

import { User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Menu } from "@nimara/domain/objects/Menu";
import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";

import { MobileNavigation } from "@/components/mobile-navigation";
import { LocalizedLink, usePathname } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

import { CurrencySwitch } from "../currency-switch";
import { LocaleSwitch } from "../locale-switch";

const BurgerIcon = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <span className="relative flex h-6 w-6 items-center justify-center">
      {/* Верхняя линия */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          height: '2px',
          width: '24px',
          borderRadius: '9999px',
          backgroundColor: 'currentColor',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen
            ? 'translateY(0) rotate(45deg) scale(1.1)'
            : 'translateY(-8px) rotate(0deg) scale(1)',
        }}
      />
      {/* Средняя линия */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          height: '2px',
          width: '24px',
          borderRadius: '9999px',
          backgroundColor: 'currentColor',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'scale(0.8)' : 'scale(1)',
        }}
      />
      {/* Нижняя линия */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          height: '2px',
          width: '24px',
          borderRadius: '9999px',
          backgroundColor: 'currentColor',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen
            ? 'translateY(0) rotate(-45deg) scale(1.1)'
            : 'translateY(8px) rotate(0deg) scale(1)',
        }}
      />
    </span>
  );
};
// import { ThemeToggle } from "./theme-toggle";

export const MobileSideMenu = ({
  menu,
  user,
}: {
  menu: Menu | null | undefined;
  user: User | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const pathname = usePathname();
  const t = useTranslations();

  // Мемоизация menu label
  const menuLabel = useMemo(
    () => isOpen
      ? t("navigation.close-menu", { defaultMessage: "Close menu" })
      : t("navigation.open-menu", { defaultMessage: "Open menu" }),
    [isOpen, t]
  );

  useEffect(() => {
    const update = () => {
      const el = document.getElementById("site-header");

      setHeaderHeight(el ? Math.ceil(el.getBoundingClientRect().height) : 0);
    };

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.body.classList.toggle("overflow-hidden", isOpen);

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const handleMenuItemClick = useCallback((isMenuItemClicked: boolean) => {
    setIsOpen(!isMenuItemClicked);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);

  const overlayClasses = useMemo(
    () =>
      cn(
        "fixed inset-x-0 z-40 bg-black/30 transition-opacity duration-300",
        {
          "pointer-events-none opacity-0": !isOpen,
          "opacity-100": isOpen,
        },
      ),
    [isOpen],
  );

  // Мемоизация panel style
  const panelStyle = useMemo(
    () => headerHeight
      ? { top: headerHeight, height: `calc(100vh - ${headerHeight}px)` }
      : { top: 64, height: "calc(100vh - 64px)" },
    [headerHeight]
  );

  // Мемоизация overlay style
  const overlayStyle = useMemo(
    () => headerHeight ? { top: headerHeight, bottom: 0 } : { top: 64, bottom: 0 },
    [headerHeight]
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="gap-1 transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95"
        onClick={toggleMenu}
        title={menuLabel}
        aria-label={menuLabel}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-drawer"
      >
        <BurgerIcon isOpen={isOpen} />
      </Button>

      <div
        className={overlayClasses}
        style={overlayStyle}
        onClick={closeMenu}
      />

      <aside
        id="mobile-navigation-drawer"
        aria-label={menuLabel}
        style={panelStyle}
        className={cn(
          "fixed left-0 z-50 w-[min(88vw,18rem)] translate-x-0 bg-background shadow-xl transition-transform duration-300",
          {
            "-translate-x-full": !isOpen,
          },
        )}
      >
        <div className="flex h-full flex-col gap-6 px-6 pb-safe pt-6">
          <span className="pointer-events-none absolute inset-y-0 right-[-1px] w-8 bg-gradient-to-r from-background via-background/40 to-transparent" />
          <div className="no-scrollbar flex-1 overflow-y-auto pr-1">
            <MobileNavigation
              menu={menu}
              onMenuItemClick={handleMenuItemClick}
            />
          </div>

          <div className="bg-background flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div className="flex flex-wrap gap-2">
              <LocaleSwitch />
              <CurrencySwitch />
            </div>
            <Button asChild variant="ghost" className="inline-flex gap-1.5">
              <LocalizedLink
                href={
                  !user
                    ? paths.signIn.asPath()
                    : paths.account.profile.asPath()
                }
              >
                <UserIcon className="h-4 w-4" />
                {user?.firstName ?? t("auth.sign-in")}
              </LocalizedLink>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
