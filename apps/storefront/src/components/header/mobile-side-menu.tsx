"use client";

import { User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
          position: "absolute",
          left: 0,
          height: "2px",
          width: "24px",
          borderRadius: "9999px",
          backgroundColor: "currentColor",
          transition: "all 400ms cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isOpen
            ? "translateY(0) rotate(45deg) scale(1.1)"
            : "translateY(-8px) rotate(0deg) scale(1)",
        }}
      />
      {/* Средняя линия */}
      <span
        style={{
          position: "absolute",
          left: 0,
          height: "2px",
          width: "24px",
          borderRadius: "9999px",
          backgroundColor: "currentColor",
          transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? "scale(0.8)" : "scale(1)",
        }}
      />
      {/* Нижняя линия */}
      <span
        style={{
          position: "absolute",
          left: 0,
          height: "2px",
          width: "24px",
          borderRadius: "9999px",
          backgroundColor: "currentColor",
          transition: "all 400ms cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isOpen
            ? "translateY(0) rotate(-45deg) scale(1.1)"
            : "translateY(8px) rotate(0deg) scale(1)",
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
  const [overscrollOffset, setOverscrollOffset] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const t = useTranslations();

  // Мемоизация menu label
  const menuLabel = useMemo(
    () =>
      isOpen
        ? t("navigation.close-menu", { defaultMessage: "Close menu" })
        : t("navigation.open-menu", { defaultMessage: "Open menu" }),
    [isOpen, t],
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
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);

  // Обработка overscroll эффекта
  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container || !isOpen) {
      return;
    }

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const _isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
      const _isAtTop = scrollTop <= 5;

      if (!isScrolling) {
        isScrolling = true;
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        setOverscrollOffset(0);
      }, 150);
    };

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
      const isAtTop = scrollTop <= 5;

      if ((isAtBottom && e.deltaY > 0) || (isAtTop && e.deltaY < 0)) {
        e.preventDefault();
        const offset = Math.min(Math.abs(e.deltaY) / 10, 15);

        setOverscrollOffset(e.deltaY > 0 ? offset : -offset);

        setTimeout(() => {
          setOverscrollOffset(0);
        }, 200);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];

      container.dataset.touchStartY = String(touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
      const isAtTop = scrollTop <= 5;

      const touch = e.touches[0];
      const startY = parseFloat(container.dataset.touchStartY || "0");
      const deltaY = startY - touch.clientY;

      if ((isAtBottom && deltaY < 0) || (isAtTop && deltaY > 0)) {
        const offset = Math.min(Math.abs(deltaY) / 10, 20);

        setOverscrollOffset(deltaY < 0 ? offset : -offset);
      }
    };

    const handleTouchEnd = () => {
      setOverscrollOffset(0);
      delete container.dataset.touchStartY;
    };

    container.addEventListener("scroll", handleScroll);
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      clearTimeout(scrollTimeout);
    };
  }, [isOpen]);

  const overlayClasses = useMemo(
    () =>
      cn(
        "fixed inset-x-0 z-40 bg-black/30 backdrop-blur-sm transition-all duration-500",
        {
          "pointer-events-none opacity-0": !isOpen,
          "opacity-100": isOpen,
        },
      ),
    [isOpen],
  );

  // Мемоизация panel style
  const panelStyle = useMemo(
    () =>
      headerHeight
        ? { top: headerHeight, height: `calc(100vh - ${headerHeight}px)` }
        : { top: 64, height: "calc(100vh - 64px)" },
    [headerHeight],
  );

  // Мемоизация overlay style
  const overlayStyle = useMemo(
    () =>
      headerHeight ? { top: headerHeight, bottom: 0 } : { top: 64, bottom: 0 },
    [headerHeight],
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="gap-1 transition-all duration-300 hover:bg-stone-100 active:scale-95 dark:hover:bg-stone-800"
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
        style={{
          ...panelStyle,
          transform: isOpen
            ? "translateX(0) scale(1)"
            : "translateX(-100%) scale(0.95)",
          opacity: isOpen ? 1 : 0,
          transition: "all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        className="bg-background fixed left-0 z-50 w-[min(88vw,18rem)] shadow-xl"
      >
        <div className="pb-safe flex h-full flex-col gap-6 px-6 pt-6">
          <span className="from-background via-background/40 pointer-events-none absolute inset-y-0 right-[-1px] w-8 bg-gradient-to-r to-transparent" />
          <div
            ref={scrollContainerRef}
            className="no-scrollbar flex-1 overflow-y-auto pr-1"
            style={{
              transform: `translateY(${overscrollOffset}px)`,
              transition:
                overscrollOffset === 0
                  ? "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)"
                  : "none",
            }}
          >
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
                  !user ? paths.signIn.asPath() : paths.account.profile.asPath()
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
