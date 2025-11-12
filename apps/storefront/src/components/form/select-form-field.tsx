"use client";

import { memo, useCallback } from "react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from "@nimara/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import type { SelectOptions } from "./types";

export interface SelectFormFieldProps {
  isRequired?: boolean;
  label: string;
  name: string;
  onChange?: (value: string) => void;
  options?: SelectOptions;
  placeholder?: string;
}

const SelectFormFieldComponent = ({
  label,
  name,
  isRequired = false,
  placeholder,
  onChange,
  options,
}: SelectFormFieldProps) => {
  const { control } = useFormContext();

  // Мемоизация обработчика изменения
  const handleValueChange = useCallback((value: string, fieldOnChange: (...event: any[]) => void) => {
    fieldOnChange(value);
    onChange?.(value);
  }, [onChange]);

  return (
    <FormField
      key={name}
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="flex-1">
          <FormLabel>
            {label}
            {isRequired && "*"}
          </FormLabel>
          <Select
            key={field.value}
            onValueChange={(value) => handleValueChange(value, field.onChange)}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger aria-label={label} error={fieldState.invalid}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options?.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

// Мемоизация - используется в формах адресов, чекаута
export const SelectFormField = memo(SelectFormFieldComponent, (prevProps, nextProps) => {
  return (
    prevProps.name === nextProps.name &&
    prevProps.label === nextProps.label &&
    prevProps.isRequired === nextProps.isRequired &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.options?.length === nextProps.options?.length
  );
});
