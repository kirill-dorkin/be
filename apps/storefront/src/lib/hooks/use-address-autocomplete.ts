"use client";

import { useCallback, useState } from "react";

export type AddressSuggestion = {
  displayName: string;
  country?: string;
  state?: string;
  city?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  lat?: string;
  lon?: string;
};

type NominatimResult = {
  display_name: string;
  address: {
    country?: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
    road?: string;
    house_number?: string;
    postcode?: string;
  };
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

        const raw = (await response.json()) as unknown;

        if (!Array.isArray(raw)) {
          throw new Error("Unexpected address autocomplete response");
        }

        const formatted = (raw as NominatimResult[]).map((result) => ({
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
