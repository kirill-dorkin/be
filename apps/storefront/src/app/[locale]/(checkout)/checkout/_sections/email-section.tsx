import { getTranslations } from "next-intl/server";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getCheckoutService } from "@/services/checkout";
import { storefrontLogger } from "@/services/logging";

export const EmailSection = async ({
  checkout,
  user,
}: {
  checkout: Checkout;
  user: User | null;
}) => {
  const t = await getTranslations();

  if (!checkout?.email && user) {
    const checkoutService = await getCheckoutService();
    const result = await checkoutService.checkoutEmailUpdate({
      checkout,
      email: user.email,
    });

    if (!result.ok) {
      storefrontLogger.error("Failed to update email", result);
    }
  }

  const userFullName = user?.firstName
    ? `${user?.firstName} ${user?.lastName},`
    : null;

  return (
    <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      {!!user ? (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-foreground sm:text-xl">
              {t("user-details.signed-in-as")}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground break-all">
              {userFullName} {user.email}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-foreground sm:text-xl">
              {t("user-details.title")}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground break-all">
              {checkout.email}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <LocalizedLink href={paths.checkout.userDetails.asPath()}>
              {t("common.edit")}
            </LocalizedLink>
          </Button>
        </div>
      )}
    </section>
  );
};
