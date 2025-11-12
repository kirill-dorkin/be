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
      className="sticky top-28 space-y-4 self-start rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {heading.overline}
        </p>
        <h2 className="text-foreground text-xl font-semibold">
          {heading.title}
        </h2>
        {heading.subtitle ? (
          <p className="text-muted-foreground text-sm">{heading.subtitle}</p>
        ) : null}
      </div>
      <ul className="space-y-2">
        {links.map((link) => {
          const isActive = normalized === link.href;

          return (
            <li key={link.href}>
              <LocalizedLink
                href={link.href}
                className={[
                  "block rounded-xl border px-4 py-3 transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent hover:border-border hover:bg-muted",
                ].join(" ")}
              >
                <span className="block text-sm font-semibold">
                  {link.label}
                </span>
                {link.description ? (
                  <span className="text-muted-foreground block text-xs">
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
