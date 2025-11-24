import { type CountryCode,isValidPhoneNumber } from "libphonenumber-js";
import * as z from "zod";

import { ALLOWED_COUNTRY_CODES } from "@nimara/domain/consts";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";

import { type GetTranslations } from "@/types";

export const addressSchema = ({
  addressFormRows,
  country,
  t,
}: {
  addressFormRows: readonly AddressFormRow[];
  country?: CountryCode;
  t: GetTranslations;
}) =>
  z.object({
    country: z.enum(ALLOWED_COUNTRY_CODES),
    firstName: z
      .string()
      .trim()
      .optional()
      .superRefine(
        checkIfRequired({ addressFormRows, fieldName: "firstName", t }),
      ),
    lastName: z
      .string()
      .trim()
      .optional()
      .superRefine(
        checkIfRequired({ addressFormRows, fieldName: "lastName", t }),
      ),
    city: z
      .string()
      .trim()
      .optional()
      .superRefine(checkIfRequired({ addressFormRows, fieldName: "city", t })),
    phone: z
      .string()
      .trim()
      .optional()
      .superRefine((arg: string | undefined, ctx: z.RefinementCtx) => {
        const foundField = addressFormRows
          .flat()
          .find((field) => field.name === "phone");

        if (!foundField) {
          return;
        }

        // Проверяем обязательность поля
        if (foundField.isRequired && !arg) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_type,
            path: [],
            fatal: true,
            message: t("form-validation.required"),
            expected: "string",
            received: typeof arg,
          });
          
return;
        }

        // Если номер введен, проверяем его валидность
        if (arg && arg.trim()) {
          const phoneNumber = arg.trim();

          try {
            const isValid = isValidPhoneNumber(phoneNumber, country || "KG");

            if (!isValid) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [],
                fatal: true,
                message: t("form-validation.invalid-phone"),
              });
            }
          } catch (e) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [],
              fatal: true,
              message: t("form-validation.invalid-phone"),
            });
          }
        }
      }),
    postalCode: z
      .string()
      .trim()
      .optional()
      .superRefine(
        checkIfRequired({ addressFormRows, fieldName: "postalCode", t }),
      ),
    companyName: z
      .string()
      .trim()
      .optional()
      .superRefine(
        checkIfRequired({ addressFormRows, fieldName: "companyName", t }),
      ),
    cityArea: z
      .string()
      .trim()
      .optional()
      .superRefine(
        checkIfRequired({ addressFormRows, fieldName: "cityArea", t }),
      ),
    streetAddress1: z
      .string()
      .trim()
      .optional()
      .superRefine(
        checkIfRequired({ addressFormRows, fieldName: "streetAddress1", t }),
      ),
    streetAddress2: z
      .string()
      .trim()
      .optional()
      .superRefine(
        checkIfRequired({ addressFormRows, fieldName: "streetAddress2", t }),
      ),
    countryArea: z
      .string()
      .trim()
      .optional()
      .superRefine(
        checkIfRequired({ addressFormRows, fieldName: "countryArea", t }),
      ),
  });

export const checkIfRequired =
  ({
    addressFormRows,
    fieldName,
    t,
  }: {
    addressFormRows: readonly AddressFormRow[];
    fieldName: string;
    t: GetTranslations;
  }) =>
  (arg: string | undefined, ctx: z.RefinementCtx) => {
    const foundField = addressFormRows
      .flat()
      .find((field) => field.name === fieldName);

    if (!foundField) {
      return;
    }
    if (foundField.isRequired && !arg) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        path: [],
        fatal: true,
        message: t("form-validation.required"),
        expected: "string",
        received: typeof arg,
      });
    }

    if (foundField.matchers) {
      const isValid = foundField.matchers.some((matcher) =>
        new RegExp(matcher, "gi").test(arg as string),
      );

      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [],
          fatal: true,
          message: t("form-validation.wrong-code-format"),
        });
      }
    }
  };

export type AddressSchema = z.infer<ReturnType<typeof addressSchema>>;
