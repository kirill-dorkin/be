import { type CountryCode } from "libphonenumber-js";
import * as z from "zod";

import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";

import { addressSchema } from "@/components/address-form/schema";
import type { GetTranslations } from "@/types";

export const formSchema = ({
  addressFormRows,
  t,
  country,
}: {
  addressFormRows: readonly AddressFormRow[];
  country?: CountryCode;
  t: GetTranslations;
}) =>
  addressSchema({ addressFormRows, t, country }).merge(
    z.object({
      isDefaultShippingAddress: z.boolean(),
      isDefaultBillingAddress: z.boolean(),
    }),
  );

export type FormSchema = z.infer<ReturnType<typeof formSchema>>;
