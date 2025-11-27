import type {
  CountriesGetInfra,
  CountriesGetUseCase,
} from "#root/address/types";

export const countriesGetUseCase = ({
  countriesGetInfra,
}: {
  countriesGetInfra: CountriesGetInfra;
}): CountriesGetUseCase => {
  const allowedCountries = new Set(ALLOWED_COUNTRY_CODES);

  return async (opts) => {
    const result = await countriesGetInfra(opts);

    if (!result.ok) {
      return result;
    }

    return ok(
      result.data.filter((country) => allowedCountries.has(country.value)),
    );
  };
};
import { ALLOWED_COUNTRY_CODES } from "@nimara/domain/consts";
import { ok } from "@nimara/domain/objects/Result";
