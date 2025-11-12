import { type SortByOption } from "@nimara/domain/objects/Search";
import type { Facet } from "@nimara/infrastructure/use-cases/search/types";

import { FiltersSheet } from "./filters-sheet";

type Props = {
  facets: Facet[];
  searchParams: Record<string, string>;
  sortByOptions: SortByOption[];
};

export const FiltersContainer = async ({
  facets,
  searchParams,
  sortByOptions,
}: Props) => {
  return (
    <FiltersSheet
      facets={facets}
      searchParams={searchParams}
      sortByOptions={sortByOptions}
    />
  );
};
