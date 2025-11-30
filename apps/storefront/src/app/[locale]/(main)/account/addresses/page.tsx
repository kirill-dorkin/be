import { PlusIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type Address } from "@nimara/domain/objects/Address";

import { getAccessToken } from "@/auth";
import { displayFormattedAddressLines } from "@/lib/address";
import { type SupportedLocale } from "@/regions/types";
import { getAddressService } from "@/services/address";
import { getUserService } from "@/services/user";

import { AddNewAddressModal } from "./_modals/create-address-modal";
import { EditAddressModal } from "./_modals/update-address-modal";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
  searchParams: Promise<Record<string, string>>;
};

export default async function Page(props: PageProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const [accessToken, userService, addressService] = await Promise.all([
    getAccessToken(),
    getUserService(),
    getAddressService(),
  ]);
  const [t, resultUserAddresses] = await Promise.all([
    getTranslations(),
    userService.addressesGet({ variables: { accessToken } }),
  ]);

  const savedAddresses = resultUserAddresses.data ?? [];
  const formattedAddresses =
    (await Promise.all(
      savedAddresses.map(async (address) => {
        const resultFormatAddress = await addressService.addressFormat({
          variables: { address },
          locale,
        });

        if (!resultFormatAddress.ok) {
          throw new Error("No address format.");
        }

        return {
          ...resultFormatAddress.data,
          ...address,
        };
      }),
    )) ?? [];

  const defaultAddresses: typeof formattedAddresses = [];
  const rest: typeof defaultAddresses = [];

  formattedAddresses.forEach((a) => {
    if (
      (a.isDefaultBillingAddress || a.isDefaultShippingAddress) &&
      !defaultAddresses.some((address) => address.id === a.id)
    ) {
      defaultAddresses.push(a);

      return;
    }
    rest.push(a);
  });

  const sortedAddresses = [...defaultAddresses, ...rest];
  const noAddresses = !resultUserAddresses.data?.length;

  function getDefaultAddressLabel({
    isDefaultBillingAddress,
    isDefaultShippingAddress,
  }: Pick<Address, "isDefaultBillingAddress" | "isDefaultShippingAddress">) {
    return isDefaultBillingAddress && isDefaultShippingAddress
      ? "address.default-shipping-and-billing"
      : isDefaultShippingAddress
        ? "address.default-shipping"
        : "address.default-billing";
  }

  const resultCountries = await addressService.countriesAllGet({ locale });

  if (!resultCountries.ok) {
    throw new Error("No countries.");
  }

  const countryCode = (() => {
    // Кыргызстан как страна по умолчанию для всех регионов
    const defaultCountryCode = "KG" as AllCountryCode;
    const paramsCountryCode = searchParams.country;

    if (!paramsCountryCode) {
      return defaultCountryCode;
    }
    const isValidCountryCode = resultCountries.data.some(
      (countryCode) => countryCode.value === paramsCountryCode,
    );

    if (!isValidCountryCode) {
      return defaultCountryCode;
    }

    return paramsCountryCode;
  })() as AllCountryCode;

  const resultAddressRows = await addressService.addressFormGetRows({
    countryCode: countryCode,
  });

  if (!resultAddressRows.ok) {
    throw new Error("No address form rows.");
  }

  return (
    <div className="flex flex-col gap-8 text-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="dark:text-primary text-2xl text-slate-700">
          {t("account.addresses")}
        </h2>
        {!noAddresses && (
          <div className="w-full sm:w-auto">
            <AddNewAddressModal
              addressFormRows={resultAddressRows.data}
              countries={resultCountries.data}
              countryCode={countryCode}
              buttonContent={
                <>
                  <PlusIcon className="h-4 w-4" />
                  <span className="hidden sm:block">
                    {t("address.add-new-address")}
                  </span>
                </>
              }
              buttonProps={{
                variant: "outline",
                className:
                  "text-slate-700 dark:text-primary flex w-full items-center gap-1 rounded px-[11px] sm:w-auto sm:rounded-md sm:px-4",
              }}
            />
          </div>
        )}
      </div>
      {noAddresses && (
        <div className="space-y-8">
          <hr />
          <p className="dark:text-muted-foreground text-stone-500">
            {t("address.sorry-you-dont-have-any-addresses")}
          </p>
          <AddNewAddressModal
            addressFormRows={resultAddressRows.data}
            countries={resultCountries.data}
            countryCode={countryCode}
            buttonContent={
              <>
                <PlusIcon className="h-4 w-4" />
                {t("address.add-new-address")}
              </>
            }
            buttonProps={{
              className: "mt-6 flex items-center gap-1",
            }}
          />
        </div>
      )}
      {sortedAddresses.map(
        ({ isDefaultBillingAddress, isDefaultShippingAddress, ...address }) => (
          <div
            key={address.id}
            className="dark:text-primary space-y-6 text-slate-700"
          >
            <hr />
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100/80 bg-white/90 p-4 sm:grid-cols-12 sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="sm:col-span-7 lg:col-span-6">
                {displayFormattedAddressLines({
                  addressId: address.id,
                  formattedAddress: address.formattedAddress,
                })}
              </div>
              <div className="flex flex-col gap-2 sm:col-span-5 sm:flex-row sm:items-center sm:justify-end lg:col-span-6">
                {(isDefaultBillingAddress || isDefaultShippingAddress) && (
                  <p className="text-sm font-semibold sm:order-2 sm:text-right">
                    {t(
                      getDefaultAddressLabel({
                        isDefaultBillingAddress,
                        isDefaultShippingAddress,
                      }),
                    )}
                  </p>
                )}
                <div className="sm:order-1">
                  <EditAddressModal
                    address={{
                      isDefaultBillingAddress,
                      isDefaultShippingAddress,
                      ...address,
                    }}
                    addressFormRows={resultAddressRows.data}
                    countries={resultCountries.data}
                  />
                </div>
              </div>

              {(isDefaultBillingAddress || isDefaultShippingAddress) && (
                <div className="sm:hidden">
                  <p className="text-sm font-semibold">
                    {t(
                      getDefaultAddressLabel({
                        isDefaultBillingAddress,
                        isDefaultShippingAddress,
                      }),
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
