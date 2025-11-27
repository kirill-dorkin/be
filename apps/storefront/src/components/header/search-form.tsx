"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { CircleX, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type KeyboardEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  type ComboboxOption,
} from "@nimara/ui/components/combobox";
import { Spinner } from "@nimara/ui/components/spinner";

import { DEFAULT_DEBOUNCE_TIME_IN_MS } from "@/config";
import { LocalizedLink, usePathname, useRouter } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { getCurrentRegion } from "@/regions/server";
import { getSearchService } from "@/services/search";

import { performSearch } from "./actions";

type SearchState = {
  highlightedOptionIndex: number;
  inputValue: string;
  options: ComboboxOption[];
  showOptions: boolean;
  status: "LOADING" | "IDLE";
};

const minLetters = 3;
const maxSearchSuggestions = 15;
const keyboardCodes = {
  ArrowDown: "ArrowDown",
  ArrowUp: "ArrowUp",
  Enter: "Enter",
};
const initialSearchState: SearchState = {
  highlightedOptionIndex: -1,
  inputValue: "",
  options: [],
  status: "IDLE",
  showOptions: false,
};

export const SearchForm = ({ onSubmit }: { onSubmit?: () => void }) => {
  const ts = useTranslations("search");
  const tc = useTranslations("common");

  const pathname = usePathname();

  const router = useRouter();
  const [
    { inputValue, options, highlightedOptionIndex, showOptions, status },
    setSearchState,
  ] = useState<SearchState>(initialSearchState);

  // Мемоизация вычисляемых значений для производительности
  const computedValues = useMemo(() => ({
    isLoading: status === "LOADING",
    isIdle: status === "IDLE",
    isNoOptionHighlighted: highlightedOptionIndex === -1,
    isLastOptionHighlighted: highlightedOptionIndex === options.length,
    hasQuery: inputValue.trim().length > 0,
  }), [status, highlightedOptionIndex, options.length, inputValue]);

  const { isLoading, isIdle, isNoOptionHighlighted, isLastOptionHighlighted, hasQuery } = computedValues;

  const isNoResultsState = useMemo(
    () => isIdle && showOptions && !options.length && hasQuery,
    [isIdle, showOptions, options.length, hasQuery]
  );

  const debouncedInputValue = useDebounce(
    inputValue,
    DEFAULT_DEBOUNCE_TIME_IN_MS,
  );

  const resetSearchState = useCallback(
    () =>
      setSearchState((state) => ({
        ...initialSearchState,
        // Не прячем выпадашку автоматически
        showOptions: false,
        // сохраняем текущее значение, если было
        inputValue: state.inputValue ?? "",
      })),
    [],
  );

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback((event) => {
    if (event.code === keyboardCodes.Enter) {
      event.preventDefault();
      resetSearchState();
      if (onSubmit) {
        onSubmit();
      }

      // Handle query search
      if (isNoOptionHighlighted || isLastOptionHighlighted) {
        router.push(paths.search.asPath({ query: { q: inputValue } }));

        return;
      }

      // Handle product selection
      const slug = options[highlightedOptionIndex].slug;

      router.push(slug ? paths.products.asPath({ slug: slug }) : "#");
    }

    if (event.code === keyboardCodes.ArrowUp) {
      event.preventDefault();

      const prevIndex = isNoOptionHighlighted
        ? options.length
        : highlightedOptionIndex - 1;

      setSearchState((state) => ({
        ...state,
        highlightedOptionIndex: prevIndex,
      }));
    }

    if (event.code === keyboardCodes.ArrowDown) {
      event.preventDefault();

      const nextIndex =
        highlightedOptionIndex < options.length
          ? highlightedOptionIndex + 1
          : -1;

      setSearchState((state) => ({
        ...state,
        highlightedOptionIndex: nextIndex,
      }));
    }
  }, [inputValue, isNoOptionHighlighted, isLastOptionHighlighted, highlightedOptionIndex, options, onSubmit, resetSearchState, router]);

  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isNoOptionHighlighted || isLastOptionHighlighted) {
      router.push(paths.search.asPath({ query: { q: inputValue } }));
    }

    if (onSubmit) {
      onSubmit();
    }
    resetSearchState();
  }, [inputValue, isNoOptionHighlighted, isLastOptionHighlighted, onSubmit, resetSearchState, router]);

  const handleClear = useCallback(() => {
    resetSearchState();
  }, [resetSearchState]);

  useEffect(() => {
    const inputValueLength = debouncedInputValue.length;

    if (inputValueLength === 0) {
      setSearchState((state) => ({
        ...state,
        status: "IDLE",
        options: [],
        showOptions: false,
      }));

      return;
    }

    const isQueryLengthSufficient = inputValueLength >= minLetters;

    if (isQueryLengthSufficient) {
      void searchProducts(debouncedInputValue).then(({ results }) => {
        setSearchState((state) => ({
          ...state,
          status: "IDLE",
          options: results,
          showOptions: results.length > 0,
        }));
      });
    } else {
      setSearchState((state) => ({
        ...state,
        status: "IDLE",
        options: [],
        showOptions: false,
      }));
    }
  }, [debouncedInputValue, resetSearchState]);

  useEffect(() => {
    // При монтировании/смене пути скрываем дропдаун, сбрасывая выделение
    setSearchState((state) => ({
      ...state,
      showOptions: false,
      highlightedOptionIndex: -1,
    }));
  }, []); // зависимости пустые, чтобы не менять сигнатуру

  const renderAdornmentContent = useCallback(() => {
    if (isLoading) {
      return <Spinner size={16} />;
    }

    if (isNoResultsState) {
      return <CircleX aria-hidden className="h-4 w-4" />;
    }

    return <Search aria-hidden={true} height={16} />;
  }, [isLoading, isNoResultsState]);

  const adornmentAria = useMemo(() => isLoading
    ? ts("loading-text")
    : isNoResultsState
      ? ts("clear-search")
      : tc("submit"), [isLoading, isNoResultsState, ts, tc]);

  return (
    <form
      action={performSearch}
      aria-label={ts("site-wide-search-form")}
      role="search"
      onSubmit={handleSubmit}
    >
      <div>
        <Combobox className="z-50">
          <ComboboxInput
          endAdornment={
            <Button
              aria-label={adornmentAria}
              size="icon"
              type={
                isLoading || isNoResultsState ? "button" : "submit"
              }
              variant="ghost"
              className={cn(
                "cursor-pointer text-foreground/70 hover:text-foreground",
                isLoading && "pointer-events-none text-foreground/50",
              )}
              onClick={isNoResultsState ? handleClear : undefined}
            >
              {renderAdornmentContent()}
            </Button>
          }
          inputProps={{
            onChange: (event) =>
              setSearchState((state) => ({
                ...state,
                status:
                  event.target.value.length >= minLetters ? "LOADING" : "IDLE",
                inputValue: event.target.value,
                showOptions: event.target.value.length > 0 || state.showOptions,
              })),
            onKeyDown: handleKeyDown,
            placeholder: ts("search-placeholder"),
            value: inputValue,
            className: cn(
              "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none border border-stone-200/60 bg-white/95 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.35)] transition-colors",
              hasQuery
                ? "border-stone-300/80 focus:border-stone-400/80"
                : "focus:border-stone-300/70",
            ),
          }}
        />

        <div className="max-h-80 overflow-auto">
          <ComboboxGroup
            ariaLabel={ts("search-results")}
            expanded={showOptions}
          >
            {options.map((suggestion, index) => (
              <ComboboxItem
                key={suggestion.id}
                isSelected={index === highlightedOptionIndex}
              >
                <LocalizedLink
                  className="flex gap-1 px-1.5 py-2 hover:cursor-pointer"
                  href={
                    suggestion.slug
                      ? paths.products.asPath({ slug: suggestion.slug })
                      : "#"
                  }
                  onClick={() => resetSearchState()}
                >
                  <Search className="self-center" height={16} />
                  {suggestion.label}
                </LocalizedLink>
              </ComboboxItem>
            ))}

            <ComboboxItem isSelected={isLastOptionHighlighted}>
              <LocalizedLink
                className="flex gap-1 px-1.5 py-2 pl-8 hover:cursor-pointer"
                href={paths.search.asPath({ query: { q: inputValue } })}
                onClick={() => resetSearchState()}
              >
                {ts("search-for", { query: inputValue })}
              </LocalizedLink>
            </ComboboxItem>
          </ComboboxGroup>
        </div>

        {isLoading && <ComboboxEmpty>{ts("loading-text")}</ComboboxEmpty>}

        {isIdle && showOptions && !options.length && (
          <ComboboxEmpty>{ts("no-results")}</ComboboxEmpty>
        )}
      </Combobox>
      </div>
    </form>
  );
};

const searchProducts = async (
  value: string,
): Promise<{ results: ComboboxOption[] }> => {
  const [region, searchService] = await Promise.all([
    getCurrentRegion(),
    getSearchService(),
  ]);
  const result = await searchService.search(
    {
      query: value,
      limit: maxSearchSuggestions,
    },
    {
      languageCode: region.language.code,
      channel: region.market.channel,
    },
  );

  const products = result.ok ? result.data.results : [];

  return {
    results:
      products.map((result) => ({
        id: result.id,
        label: result.name,
        slug: result.slug,
      })) ?? [],
  };
};
