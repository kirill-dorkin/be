import { z } from "zod";
import { type CountryCode } from "libphonenumber-js";

import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";

import { addressSchema } from "@/components/address-form/schema";
import { type GetTranslations } from "@/types";

type Params = {
  addressFormRows: readonly AddressFormRow[];
  t: GetTranslations;
  country?: CountryCode;
};

const baseShippingAddressSchema = (params: Params) => addressSchema(params);

export const createShippingAddressSchema = (params: Params) =>
  baseShippingAddressSchema(params).merge(
    z.object({
      saveForFutureUse: z.boolean(),
    }),
  );
export type CreateShippingAddressSchema = z.infer<
  ReturnType<typeof createShippingAddressSchema>
>;

export const updateShippingAddressSchema = (params: Params) =>
  baseShippingAddressSchema(params);
export type UpdateShippingAddressSchema = z.infer<
  ReturnType<typeof updateShippingAddressSchema>
>;

export const savedAddressSchema = z.object({ shippingAddressId: z.string() });
export type SavedAddressFormSchema = z.infer<typeof savedAddressSchema>;
