"use client";

import { useCallback, useState } from "react";

export type AddressSuggestion = {
  city?: string;
  country?: string;
  displayName: string;
  houseNumber?: string;
  lat?: string;
  lon?: string;
  postalCode?: string;
  state?: string;
  street?: string;
};

type NominatimResult = {
  address: {
    city?: string;
    country?: string;
    house_number?: string;
    postcode?: string;
    road?: string;
    state?: string;
    town?: string;
    village?: string;
  };
  display_name: string;
  lat: string;
  lon: string;
};

export const useAddressAutocomplete = (
  countryCode?: string,
  locale?: string,
) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchAddress = useCallback(
    async (query: string) => {
      if (!query || query.length < 3) {
        setSuggestions([]);

        return;
      }

      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          q: query,
          ...(countryCode && { countryCode }),
          ...(locale && { locale }),
        });

        const response = await fetch(`/api/address/autocomplete?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch address suggestions");
        }

        const raw = await response.json();

        if (!isNominatimResultArray(raw)) {
          throw new Error("Unexpected address autocomplete response");
        }

        const formatted = raw.map((result) => ({
          displayName: result.display_name,
          country: result.address.country,
          state: result.address.state,
          city:
            result.address.city ||
            result.address.town ||
            result.address.village,
          street: result.address.road,
          houseNumber: result.address.house_number,
          postalCode: result.address.postcode,
          lat: result.lat,
          lon: result.lon,
        }));

        setSuggestions(formatted);
      } catch (error) {
        console.error("Address autocomplete error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [countryCode, locale],
  );

  return {
    suggestions,
    isLoading,
    searchAddress,
  };
};

function isNominatimResultArray(value: unknown): value is NominatimResult[] {
  return Array.isArray(value);
}
