"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback } from "react";

import { Label } from "@nimara/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

type QuantitySelectorProps = {
  max?: number;
  min?: number;
  onChange: (quantity: number) => void;
  value: number;
};

const QuantitySelectorComponent = ({
  value,
  onChange,
  min = 1,
  max = 50,
}: QuantitySelectorProps) => {
  const t = useTranslations("products");

  const handleSelectChange = useCallback(
    (newValue: string) => {
      const qty = parseInt(newValue, 10);

      if (!isNaN(qty)) {
        onChange(qty);
      }
    },
    [onChange],
  );

  return (
    <div className="flex items-center gap-2">
      <Label className="text-muted-foreground text-sm font-medium">
        {t("quantity")}:
      </Label>
      <Select value={value.toString()} onValueChange={handleSelectChange}>
        <SelectTrigger className="border-border/60 bg-muted/30 hover:border-border/80 hover:bg-muted/40 dark:bg-muted/20 dark:hover:bg-muted/30 h-9 w-20 py-3 transition-all duration-200 dark:border-white/10 dark:hover:border-white/20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(
            (qty) => (
              <SelectItem key={qty} value={qty.toString()}>
                {qty}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export const QuantitySelector = memo(
  QuantitySelectorComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.min === nextProps.min &&
      prevProps.max === nextProps.max
    );
  },
);
