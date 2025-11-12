"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";

import type { SortByOption } from "@nimara/domain/objects/Search";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import { DEFAULT_SORT_BY } from "@/config";
import { useRouter } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import type { TranslationMessage } from "@/types";

const SearchSortByComponent = ({
  options,
  searchParams,
}: {
  options: Array<SortByOption>;
  searchParams: Record<string, string>;
}) => {
  const t = useTranslations();
  const router = useRouter();

  // Мемоизация defaultValue
  const defaultValue = useMemo(
    () => options.find(
      (option) =>
        option.value === searchParams["sortBy"] ||
        option.value === DEFAULT_SORT_BY,
    )?.value,
    [options, searchParams]
  );

  // Мемоизация обработчика изменения
  const handleValueChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams);

    // Clear the pagination
    params.delete("after");
    params.delete("before");
    params.delete("page");

    if (value === DEFAULT_SORT_BY) {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
    }

    const queryString = params.toString();
    const targetPath = queryString
      ? `${paths.search.asPath()}?${queryString}`
      : paths.search.asPath();

    router.push(targetPath);
  }, [router, searchParams]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-700 dark:text-primary text-sm font-medium">
        {t("search.sort-by")}
      </span>

      <div suppressHydrationWarning>
        <Select defaultValue={defaultValue} onValueChange={handleValueChange}>
          <SelectTrigger className="min-w-40" aria-label={t("search.sort-by")} suppressHydrationWarning>
            <SelectValue placeholder={t("search.sort-by")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map(({ value, messageKey }) => (
                <SelectItem value={value} key={value}>
                  {t(messageKey as TranslationMessage)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Мемоизация - используется на всех страницах поиска
export const SearchSortBy = memo(SearchSortByComponent, (prevProps, nextProps) => {
  return (
    prevProps.searchParams["sortBy"] === nextProps.searchParams["sortBy"] &&
    prevProps.options.length === nextProps.options.length
  );
});
