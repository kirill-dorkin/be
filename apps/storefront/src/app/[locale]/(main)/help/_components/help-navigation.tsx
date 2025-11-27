"use client";

import { usePathname } from "next/navigation";
import { memo, type ReactNode,useMemo } from "react";

import { LocalizedLink } from "@/i18n/routing";

type HelpNavLink = {
  description?: ReactNode;
  href: string;
  label: string;
};

const normalizePath = (pathname: string | null): string => {
  if (!pathname) {
    return "/";
  }

  const segments = pathname.split("/");

  if (segments.length > 1 && /^[a-z]{2}-[A-Z]{2}$/u.test(segments[1])) {
    return `/${segments.slice(2).join("/")}`;
  }

  return pathname;
};

const HelpNavigationComponent = ({
  heading,
  links,
}: {
  heading: {
    overline: string;
    subtitle?: string;
    title: string;
  };
  links: HelpNavLink[];
}) => {
  const pathname = usePathname();

  // Мемоизация нормализованного пути
  const normalized = useMemo(() => normalizePath(pathname), [pathname]);

  return (
    <nav
      aria-label="Help navigation"
      className="space-y-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:rounded-2xl sm:p-5 lg:sticky lg:top-24 lg:self-start lg:p-6"
    >
      <div className="space-y-1.5 sm:space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
          {heading.overline}
        </p>
        <h2 className="text-foreground text-lg font-semibold leading-tight sm:text-xl">
          {heading.title}
        </h2>
        {heading.subtitle ? (
          <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">{heading.subtitle}</p>
        ) : null}
      </div>
      <ul className="space-y-1.5 sm:space-y-2">
        {links.map((link) => {
          const isActive = normalized === link.href;

          return (
            <li key={link.href}>
              <LocalizedLink
                href={link.href}
                className={[
                  "block rounded-lg border px-3 py-2.5 transition-all duration-200 sm:rounded-xl sm:px-4 sm:py-3",
                  isActive
                    ? "border-primary text-primary shadow-sm focus:outline-none"
                    : "border-border/40 bg-card hover:border-primary/40 hover:bg-muted focus:outline-none focus-visible:border-primary/60 focus-visible:shadow-sm",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="block text-sm font-semibold leading-tight">
                  {link.label}
                </span>
                {link.description ? (
                  <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                    {link.description}
                  </span>
                ) : null}
              </LocalizedLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

// Мемоизация - навигация help страниц
export const HelpNavigation = memo(HelpNavigationComponent, (prevProps, nextProps) => {
  return (
    prevProps.heading.title === nextProps.heading.title &&
    prevProps.links.length === nextProps.links.length
  );
});
