"use client";

import { useRegionContext } from "./region-provider";

export const useCurrentRegion = () => {
  const { region } = useRegionContext();

  return region;
};
