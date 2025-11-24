import { type AddressInput } from "@nimara/codegen/schema";
import { type AllCountryCode, type AllLocale } from "@nimara/domain/consts";
import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";

import { ADDRESS_CORE_FIELDS } from "#root/consts";
import { pick } from "#root/lib/core";

export const addressToInput = ({
  country,
  ...address
}: Partial<Omit<Address, "id">>): AddressInput => ({
  // @ts-expect-error Dunno why it's complaining about country
  ...pick(address, ADDRESS_CORE_FIELDS),
  country: country as AllCountryCode,
});

// Переопределение названий стран для разных локалей
const COUNTRY_NAME_OVERRIDES: Partial<
  Record<AllCountryCode, Partial<Record<AllLocale, string>>>
> = {
  KG: {
    "ru-RU": "Кыргызстан",
    "ky-KG": "Кыргызстан",
  },
  GB: {},
  US: {},
  RU: {},
};

/**
 * Translate and sort a list of country codes into CountryOption objects.
 * @param countryCodes - An array of country codes to translate and sort.
 * @param locale - The locale to use for translation. Defaults to "en".
 * @returns
 */
export const translateAndSortCountries = (
  countryCodes: AllCountryCode[],
  locale: AllLocale = "en",
): CountryOption[] =>
  countryCodes
    .map((code) => {
      // Проверяем, есть ли переопределение для этой страны и локали
      const override = COUNTRY_NAME_OVERRIDES[code]?.[locale];
      const label =
        override ||
        (new Intl.DisplayNames([locale], { type: "region" }).of(
          code,
        ) as string);

      return {
        value: code,
        label,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
