"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { ADDRESS_CORE_FIELDS } from "@nimara/infrastructure/consts";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { AddressForm } from "@/components/address-form/address-form";
import {
  type AddressSchema,
  addressSchema,
} from "@/components/address-form/schema";
import { updateCheckoutAddressAction } from "@/lib/actions/update-checkout-address-action";
import { schemaToAddress } from "@/lib/address";
import { isGlobalError } from "@/lib/errors";
import { useRouterWithState } from "@/lib/hooks";
import { paths } from "@/lib/paths";

const ShippingAddressFormComponent = ({
  checkout,
  countries,
  addressFormRows,
  countryCode,
}: {
  addressFormRows: readonly AddressFormRow[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
}) => {
  const t = useTranslations();
  const { toast } = useToast();
  const [isCountryChanging, setIsCountryChanging] = useState(false);
  const { isRedirecting, push } = useRouterWithState();

  const form = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema({ addressFormRows, t })),
    defaultValues: [...ADDRESS_CORE_FIELDS].reduce(
      (acc, fieldName) => ({
        ...acc,
        [fieldName]:
          fieldName === "country"
            ? (checkout.shippingAddress?.country ?? countryCode)
            : (checkout.shippingAddress?.[fieldName] ?? ""),
      }),
      {},
    ),
  });

  // Мемоизация флага canProceed
  const canProceed = useMemo(
    () => !form.formState.isSubmitting && !isCountryChanging && !isRedirecting,
    [form.formState.isSubmitting, isCountryChanging, isRedirecting]
  );

  // Мемоизация обработчика submit
  const handleSubmit = useCallback(async (input: AddressSchema) => {
    const result = await updateCheckoutAddressAction({
      checkoutId: checkout.id,
      address: schemaToAddress(input),
      type: "shipping",
    });

    if (result.ok) {
      push(paths.checkout.deliveryMethod.asPath());

      return;
    }

    result.errors.map(({ field, code }) => {
      if (isGlobalError(field)) {
        toast({
          variant: "destructive",
          description: t(`errors.${code}`),
          title: "Error",
        });
      } else {
        form.setError(field as keyof AddressSchema, {
          message: t(`errors.${code}`),
        });
      }
    });
  }, [checkout.id, push, toast, form, t]);

  return (
    <section className="space-y-8 pt-8">
      <h3 className="scroll-m-20 text-2xl tracking-tight">
        {t("shipping-address.title")}
      </h3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-y-6"
          id="shipping-address-form"
          noValidate
        >
          <div>
            <AddressForm
              addressFormRows={addressFormRows}
              countries={countries}
              onCountryChange={setIsCountryChanging}
            />
          </div>
          <Button
            className="ml-auto"
            type="submit"
            form="shipping-address-form"
            loading={!canProceed}
            disabled={!canProceed}
          >
            {canProceed ? t("common.continue") : t("common.please-wait")}
          </Button>
        </form>
      </Form>
    </section>
  );
};

// Мемоизация - форма адреса доставки для гостя в checkout
export const ShippingAddressForm = memo(ShippingAddressFormComponent, (prevProps, nextProps) => {
  return (
    prevProps.checkout.id === nextProps.checkout.id &&
    prevProps.addressFormRows === nextProps.addressFormRows &&
    prevProps.countryCode === nextProps.countryCode
  );
});
