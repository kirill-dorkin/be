"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@nimara/ui/components/badge";
import { Button } from "@nimara/ui/components/button";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
} from "@nimara/ui/components/combobox";
import { Input } from "@nimara/ui/components/input";

import { formatAsPrice } from "@/lib/formatters/util";
import type { SupportedCurrency, SupportedLocale } from "@/regions/types";

type SelectedService = {
  name: string;
  slug: string;
  tags?: string[];
};

export type SelectedPart = {
  currency: SupportedCurrency;
  id: string;
  name: string;
  price: number;
  quantity: number;
  slug: string;
};

type PartsSelectorProps = {
  currency: SupportedCurrency;
  labels: {
    add: string;
    badge: string;
    empty: string;
    hint: string;
    inputLabel: string;
    placeholder: string;
    quantityLabel: (count: number) => string;
    resultsCaption: string;
    selectedLabel: string;
    subtotalLabel: (total: string) => string;
    suggestionsEmpty: string;
    suggestionsTitle: string;
    useSuggestion: string;
  };
  locale: SupportedLocale;
  onChange: (parts: SelectedPart[]) => void;
  selectedServices: SelectedService[];
  value: SelectedPart[];
};

type PartOption = SelectedPart & { formattedPrice: string };
type PartsResponse = { data?: PartOption[] };
type SuggestionsResponse = { data?: Record<string, PartOption[]> };

const MIN_QUERY = 2;

export const PartsSelector = ({
  currency,
  labels,
  locale,
  onChange,
  selectedServices,
  value,
}: PartsSelectorProps) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<PartOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PartOption[]>([]);

  const debouncedQuery = useDebounce(query, 200);

  const filteredOptions = useMemo(
    () => options.filter((option) => option.currency === currency),
    [options, currency],
  );

  useEffect(() => {
    if (debouncedQuery.trim().length < MIN_QUERY) {
      setOptions([]);

      return;
    }

    setLoading(true);

    void fetch("/api/parts-suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: debouncedQuery }),
    })
      .then((res) => res.json() as Promise<PartsResponse>)
      .then((json) => {
        const parts = json.data;

        setOptions(
          (parts ?? [])
            .filter((option) => option.currency === currency)
            .map((option) => ({
              ...option,
              formattedPrice: formatAsPrice({
                amount: option.price,
                currency: option.currency,
                locale,
              }),
            })),
        );
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery, locale, currency]);

  // Fetch recommended parts for selected services
  useEffect(() => {
    const slugs = Array.from(new Set(selectedServices.map((s) => s.slug)));

    if (!slugs.length) {
      setSuggestions([]);

      return;
    }

    setLoading(true);

    void fetch("/api/parts-suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ services: slugs.map((slug) => ({ slug })) }),
    })
      .then((res) => res.json() as Promise<SuggestionsResponse>)
      .then((json) => {
        const map = json.data;

        if (!map) {
          setSuggestions([]);

          return;
        }

        const collected: PartOption[] = [];

        for (const slug of slugs) {
          const items = map[slug] ?? [];

          items.forEach((item) => collected.push(item));
        }

        const deduped = new Map<string, PartOption>();

        collected.forEach((item) => {
          if (item.currency !== currency) {
            return;
          }

          if (!deduped.has(item.id)) {
            deduped.set(item.id, {
              ...item,
              formattedPrice: formatAsPrice({
                amount: item.price,
                currency: item.currency,
                locale,
              }),
            });
          }
        });

        setSuggestions(Array.from(deduped.values()));
      })
      .finally(() => setLoading(false));
  }, [selectedServices, currency, locale]);

  const handleAdd = (option: SelectedPart) => {
    const existing = value.find((item) => item.id === option.id);

    if (existing) {
      onChange(
        value.map((item) =>
          item.id === option.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );

      return;
    }

    onChange([...value, { ...option, quantity: 1 }]);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      onChange(value.filter((item) => item.id !== id));

      return;
    }

    onChange(
      value.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      ),
    );
  };

  const subtotal = useMemo(
    () =>
      value.reduce(
        (sum, part) => sum + part.price * Math.max(1, part.quantity),
        0,
      ),
    [value],
  );

  const formattedSubtotal = formatAsPrice({
    amount: subtotal,
    currency,
    locale,
  });

  return (
    <div className="border-border/70 bg-card/70 w-full space-y-4 rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {labels.selectedLabel}
          </p>
          <p className="text-muted-foreground text-xs">{labels.hint}</p>
        </div>
        <Badge variant="outline">{labels.badge}</Badge>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {labels.inputLabel}
        </label>
        <div className="relative">
          <Combobox>
            <ComboboxInput
              inputProps={{
                placeholder: labels.placeholder,
                onChange: (event) => setQuery(event.target.value),
                value: query,
              }}
              endAdornment={
                loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : null
              }
            />

            <div className="max-h-72 overflow-auto">
              <ComboboxGroup
                expanded={filteredOptions.length > 0 && query.length >= MIN_QUERY}
                ariaLabel={labels.resultsCaption}
              >
                {filteredOptions.map((option) => (
                  <ComboboxItem key={option.id} isSelected={false}>
                    <div className="flex items-center gap-3 px-2 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight text-foreground">
                          {option.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {option.formattedPrice}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => handleAdd(option)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {labels.add}
                      </Button>
                    </div>
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </div>

            {loading && (
              <ComboboxEmpty>
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {labels.resultsCaption}
                </span>
              </ComboboxEmpty>
            )}

            {!loading &&
              query.length >= MIN_QUERY &&
              filteredOptions.length === 0 && (
                <ComboboxEmpty>{labels.empty}</ComboboxEmpty>
              )}
          </Combobox>
        </div>
      </div>

      <div className="space-y-3">
        {value.length === 0 ? (
          <p className="text-muted-foreground text-sm">{labels.empty}</p>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm font-semibold text-foreground">
              <span>{labels.badge}</span>
              <span>{labels.subtotalLabel(formattedSubtotal)}</span>
            </div>
            <div className="space-y-2">
              {value.map((part) => (
                <div
                  key={part.id}
                  className="border-border/60 bg-muted/40 flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {part.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatAsPrice({
                        amount: part.price,
                        currency: part.currency,
                        locale,
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      className="h-9 w-20"
                      value={part.quantity}
                      onChange={(event) =>
                        updateQuantity(
                          part.id,
                          Number.isNaN(Number(event.target.value))
                            ? 0
                            : Number(event.target.value),
                        )
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => updateQuantity(part.id, 0)}
                    aria-label={labels.badge}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            {labels.suggestionsTitle}
          </p>
          <Badge variant="outline">{labels.useSuggestion}</Badge>
        </div>
        {suggestions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {labels.suggestionsEmpty}
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestions.map((option) => (
              <div
                key={option.id}
                className="border-border/70 bg-muted/40 flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-semibold">
                    {option.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {option.formattedPrice}
                  </p>
                </div>
                <Button size="sm" type="button" onClick={() => handleAdd(option)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {labels.add}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
