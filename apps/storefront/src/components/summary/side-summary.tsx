import { getLocale, getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@nimara/ui/components/sheet";

import { getAccessToken } from "@/auth";
import { redirect } from "@/i18n/routing";
import { getCheckoutId } from "@/lib/actions/cart";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { getCheckoutService } from "@/services/checkout";
import { getUserService } from "@/services/user";

import { ErrorDialog } from "../error-dialog";
import { Summary } from "./summary";

export const SideSummary = async () => {
  const [t, region, locale, checkoutId, accessToken, userService] = await Promise.all([
    getTranslations("common"),
    getCurrentRegion(),
    getLocale(),
    getCheckoutId(),
    getAccessToken(),
    getUserService(),
  ]);

  if (!checkoutId) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  const checkoutService = await getCheckoutService();
  const [resultCheckout, resultUserGet] = await Promise.all([
    checkoutService.checkoutGet({
      checkoutId,
      languageCode: region.language.code,
      countryCode: region.market.countryCode,
    }),
    userService.userGet(accessToken),
  ]);

  if (!resultCheckout.ok) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  const { checkout } = resultCheckout.data;
  const user = resultUserGet.ok ? resultUserGet.data : null;

  return (
    <>
      {!!checkout.problems.insufficientStock.length && (
        <ErrorDialog checkout={checkout} />
      )}
      <div className="col-span-5 hidden min-h-screen max-w-xl px-8 py-12 md:block">
        <Summary checkout={checkout} user={user} />
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="text-sm font-medium">
              {t("show-summary")}
            </Button>
          </SheetTrigger>
          <SheetContent side="right-full">
            <SheetHeader className="sr-only">
              <SheetTitle>{t("show-summary")}</SheetTitle>
            </SheetHeader>
            <Summary checkout={checkout} user={user} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

SideSummary.displayName = "SideSummary";
