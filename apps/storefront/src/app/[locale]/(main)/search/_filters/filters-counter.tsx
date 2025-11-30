import { type Facet } from "@nimara/infrastructure/use-cases/search/types";

import { getActiveFiltersCount } from "@/lib/filters";

export const FiltersCounter = ({
  facets,
  searchParams,
}: {
  facets: Facet[];
  searchParams: Record<string, string>;
}) => {
  const activeFiltersCount = getActiveFiltersCount(searchParams, facets);

  return (
    <span className="dark:text-primary text-slate-700">
      ({activeFiltersCount})
    </span>
  );
};
