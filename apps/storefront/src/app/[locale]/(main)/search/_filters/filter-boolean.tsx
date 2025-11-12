"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo, useState } from "react";

import type { Facet } from "@nimara/infrastructure/use-cases/search/types";
import { Checkbox } from "@nimara/ui/components/checkbox";
import { Label } from "@nimara/ui/components/label";

import { type TranslationMessage } from "@/types";

const FilterBooleanComponent = ({
  facet: { name, slug, messageKey },
  searchParams,
}: {
  facet: Facet;
  searchParams: Record<string, string>;
}) => {
  const t = useTranslations();
  const isCheckedInitial = searchParams[slug] === "true";
  const [isChecked, setIsChecked] = useState(isCheckedInitial);

  // Мемоизация текста и ID
  const labelText = useMemo(
    () => name ?? t(messageKey as TranslationMessage) ?? slug,
    [name, messageKey, slug, t]
  );
  const checkboxId = useMemo(() => `boolean-${slug}`, [slug]);

  // Мемоизация обработчика
  const handleCheckedChange = useCallback((checked: boolean | "indeterminate") => {
    setIsChecked(checked === true);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      {/* Hidden input to ensure checkbox value is included in FormData */}
      <input type="hidden" name={slug} value={isChecked ? "true" : ""} />

      <Checkbox
        id={checkboxId}
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
      />

      <Label
        className="text-slate-700 dark:text-primary text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor={checkboxId}
      >
        {labelText}
      </Label>
    </div>
  );
};

// Мемоизация - используется в фильтрах поиска
export const FilterBoolean = memo(FilterBooleanComponent, (prevProps, nextProps) => {
  return (
    prevProps.facet.slug === nextProps.facet.slug &&
    prevProps.searchParams[prevProps.facet.slug] === nextProps.searchParams[nextProps.facet.slug]
  );
});
