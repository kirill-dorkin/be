import { useMemo } from "react";

import { useCurrentRegion } from "@/regions/client";

import { localizedFormatter } from "./util";

export const useLocalizedFormatter = () => {
  const region = useCurrentRegion();

  return useMemo(() => localizedFormatter({ region }), [region]);
};
