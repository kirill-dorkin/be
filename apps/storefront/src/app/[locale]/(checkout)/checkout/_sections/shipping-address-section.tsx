import { getTranslations } from "next-intl/server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { displayFormattedAddressLines } from "@/lib/address";
import { paths } from "@/lib/paths";
import { type SupportedLocale } from "@/regions/types";
import { getAddressService } from "@/services/address";

export async function ShippingAddressSection({
  checkout,
  locale,
}: {
  checkout?: Checkout;
  locale: SupportedLocale;
}) {
  const t = await getTranslations();

  if (!checkout?.shippingAddress) {
    return (
      <section className="border-border/60 bg-card rounded-xl border p-5 shadow-sm">
        <div>
          <h3 className="text-foreground text-lg font-semibold sm:text-xl">
            {t("shipping-address.title")}
          </h3>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("shipping-address.add-address")}
          </p>
        </div>
      </section>
    );
  }

  const { shippingAddress } = checkout;

  const addressService = await getAddressService();
  const result = await addressService.addressFormat({
    variables: { address: shippingAddress },
    locale,
  });

  if (!result.ok) {
    throw new Error("No address form rows.");
  }

  return (
    <section className="border-border/60 bg-card rounded-xl border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h3 className="text-foreground text-lg font-semibold sm:text-xl">
            {t("shipping-address.title")}
          </h3>
          <div className="text-muted-foreground text-sm leading-relaxed">
            {displayFormattedAddressLines({
              addressId: shippingAddress.id,
              formattedAddress: result.data.formattedAddress,
            })}
          </div>
        </div>
        {shippingAddress && (
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <LocalizedLink
              href={paths.checkout.shippingAddress.asPath({
                query: { country: shippingAddress.country },
              })}
            >
              {t("common.edit")}
            </LocalizedLink>
          </Button>
        )}
      </div>
    </section>
  );
}
