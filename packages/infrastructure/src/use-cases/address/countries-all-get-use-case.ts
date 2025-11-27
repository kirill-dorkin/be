import type {
  CountriesAllGetInfra,
  CountriesAllGetUseCase,
} from "#root/address/types";

export const countriesAllGetUseCase = ({
  countriesAllGetInfra,
}: {
  countriesAllGetInfra: CountriesAllGetInfra;
}): CountriesAllGetUseCase => {
  const allowedCountries = new Set(ALLOWED_COUNTRY_CODES);

  return async (opts) => {
    const result = await countriesAllGetInfra(opts);

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
