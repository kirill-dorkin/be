"use client";

import { useLocale, useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";

import type { PageInfo } from "@nimara/infrastructure/use-cases/search/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@nimara/ui/components/pagination";

import { localePrefixes } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { DEFAULT_LOCALE, type SupportedLocale } from "@/regions/types";

type Props = {
  baseUrl: string;
  pageInfo: PageInfo;
  searchParams: Record<string, string>;
};

const SearchPaginationComponent = ({
  pageInfo,
  searchParams,
  baseUrl,
}: Props) => {
  const t = useTranslations("common");
  const locale = useLocale();

  // Мемоизация проверки локали
  const localePrefix = useMemo(() => {
    const isLocaleDifferent = locale !== DEFAULT_LOCALE;

    return isLocaleDifferent
      ? localePrefixes[
          locale as Exclude<SupportedLocale, typeof DEFAULT_LOCALE>
        ]
      : "";
  }, [locale]);

  // Мемоизация функции генерации пути
  const getPathName = useCallback(
    (direction: "next" | "previous") => {
      const params = new URLSearchParams(searchParams);

      // Delete all the pagination-related params
      params.delete("before");
      params.delete("after");
      params.delete("page");

      if (pageInfo.type === "cursor") {
        if (direction === "next") {
          params.set("after", pageInfo.after ?? "");
        } else {
          params.set("before", pageInfo.before ?? "");
        }
      } else {
        const page =
          direction === "next"
            ? pageInfo.currentPage + 1
            : pageInfo.currentPage - 1;

        params.set("page", page.toString());
      }

      const queryString = params.toString();
      const baseUrlWithParams = queryString
        ? `${baseUrl}?${queryString}`
        : baseUrl;

      if (!localePrefix) {
        return baseUrlWithParams;
      }

      return baseUrlWithParams.startsWith(localePrefix)
        ? baseUrlWithParams
        : `${localePrefix}${baseUrlWithParams}`;
    },
    [pageInfo, searchParams, baseUrl, localePrefix],
  );

  return (
    <div className="flex justify-center gap-4">
      <Pagination aria-label={t("pagination")}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              label={t("previous")}
              aria-label={t("go-to-next-page")}
              className={cn({
                "pointer-events-none text-neutral-400":
                  !pageInfo.hasPreviousPage,
              })}
              href={getPathName("previous")}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              label={t("next")}
              aria-label={t("go-to-previous-page")}
              className={cn({
                "pointer-events-none text-neutral-400": !pageInfo.hasNextPage,
              })}
              href={getPathName("next")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

// Мемоизация - используется на страницах поиска и категорий
export const SearchPagination = memo(
  SearchPaginationComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.baseUrl === nextProps.baseUrl &&
      prevProps.pageInfo.hasNextPage === nextProps.pageInfo.hasNextPage &&
      prevProps.pageInfo.hasPreviousPage ===
        nextProps.pageInfo.hasPreviousPage &&
      JSON.stringify(prevProps.searchParams) ===
        JSON.stringify(nextProps.searchParams)
    );
  },
);
