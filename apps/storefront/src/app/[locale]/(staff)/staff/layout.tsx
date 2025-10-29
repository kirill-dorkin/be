import { redirect as nextRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { type ReactNode } from "react";

import { auth } from "@/auth";
import { logout } from "@/components/account-menu/actions";
import { serverEnvs } from "@/envs/server";
import { localePrefixes, LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import {
  isApprovedRepairWorker,
  isPendingRepairWorker,
} from "@/lib/repair/metadata";
import { cn } from "@/lib/utils";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/regions/types";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const buildLocalizedPath = (locale: SupportedLocale, path: string) => {
  if (locale === DEFAULT_LOCALE) {
    return path;
  }

  const prefix = localePrefixes[
    locale as Exclude<SupportedLocale, typeof DEFAULT_LOCALE>
  ];

  return `${prefix}${path}`;
};

const resolveLocale = (locale: string): SupportedLocale => {
  if ((SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    return locale as SupportedLocale;
  }

  return DEFAULT_LOCALE;
};

export default async function StaffLayout({ children, params }: LayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const session = await auth();

  const redirectToSignIn = () =>
    nextRedirect(
      buildLocalizedPath(locale, paths.signIn.asPath({
        query: { redirectUrl: paths.staff.orders.asPath() },
      })),
    );

  if (!session?.user) {
    redirectToSignIn();
    
return null;
  }

  const user = session.user as {
    email: string;
    firstName: string;
    id: string;
    isStaff?: boolean;
    lastName: string;
    metadata?: Record<string, string>;
    permissionGroups?: Array<{ id: string; name: string }>;
  };

  const repairGroupName = serverEnvs.SERVICE_WORKER_GROUP_NAME;
  const belongsToRepairGroup = Boolean(
    user?.isStaff &&
      user.permissionGroups?.some((group) => group.name === repairGroupName),
  );

  const metadata = user?.metadata;
  const isApprovedWorker = isApprovedRepairWorker(metadata);
  const isPendingWorker = isPendingRepairWorker(metadata);

  if (!belongsToRepairGroup && !isApprovedWorker && !isPendingWorker) {
    nextRedirect(buildLocalizedPath(locale, paths.home.asPath()));
  }

  const t = await getTranslations("staff");

  const staffDisplayName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-border/60 bg-background sticky top-0 z-40 border-b shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              {t("title")}
            </span>
            <span className="text-muted-foreground text-xs">
              {t("subtitle")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {belongsToRepairGroup && (
              <nav className="hidden gap-3 md:flex">
                <LocalizedLink
                  href={paths.staff.orders.asPath()}
                  className="text-sm font-medium text-muted-foreground transition hover:text-primary"
                >
                  {t("nav.orders")}
                </LocalizedLink>
                <LocalizedLink
                  href={paths.staff.adminWorkers.asPath()}
                  className="text-sm font-medium text-muted-foreground transition hover:text-primary"
                >
                  {t("nav.workers")}
                </LocalizedLink>
              </nav>
            )}
            <span className="text-sm font-medium text-foreground">
              {staffDisplayName}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className={cn(
                  "border border-border/60 bg-background px-3 py-1 text-sm font-medium transition hover:bg-muted",
                  "rounded-full",
                )}
              >
                {t("actions.logout")}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        {isPendingWorker && !belongsToRepairGroup ? (
          <div className="border border-dashed border-primary/50 bg-primary/5 p-6 text-sm text-primary">
            {t("pending-message")}
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
