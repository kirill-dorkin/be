import { type AllCountryCode } from "@nimara/domain/consts";
import { ok } from "@nimara/domain/objects/Result";

import { translateAndSortCountries } from "#root/address/helpers";
import type {
  CountriesGetInfra,
  SaleorAddressServiceConfig,
} from "#root/address/types";

// Поддерживаемые страны для всех регионов (KG первая - страна по умолчанию)
const SUPPORTED_COUNTRIES: AllCountryCode[] = ["KG", "RU", "GB"];

export const saleorCountriesGetInfra =
  ({ logger }: SaleorAddressServiceConfig): CountriesGetInfra =>
  async ({ locale }) => {
    // Всегда возвращаем все поддерживаемые страны
    const countries = translateAndSortCountries(SUPPORTED_COUNTRIES, locale);

    logger.debug("Returning supported countries", {
      countries: SUPPORTED_COUNTRIES,
      locale,
    });

    return ok(countries);
  };
