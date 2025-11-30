"use client";

import { useTranslations } from "next-intl";
import { Children, memo, type ReactNode, useCallback } from "react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from "@nimara/ui/components/form";
import { RadioGroup, RadioGroupItem } from "@nimara/ui/components/radio-group";

import { cn } from "@/lib/utils";

export interface RadioFormGroupProps {
  children: ReactNode;
  className?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  isSrOnlyLabel?: boolean;
  label?: string;
  name: string;
  onChange?: (value: string) => void;
  options: { value: string }[];
  placeholder?: string;
}

const RadioFormGroupComponent = ({
  className,
  isSrOnlyLabel = false,
  isRequired = false,
  isDisabled = false,
  onChange,
  options,
  name,
  children,
  label,
}: RadioFormGroupProps) => {
  const t = useTranslations();
  const { control } = useFormContext();
  const { error } = control.getFieldState(name);

  // Мемоизация обработчика изменения
  const handleValueChange = useCallback(
    (value: string, fieldOnChange: (...event: any[]) => void) => {
      fieldOnChange(value);
      onChange?.(value);
    },
    [onChange],
  );

  return (
    <FormField
      key={name}
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          {label && (
            <FormLabel className={isSrOnlyLabel ? "sr-only" : ""}>
              {label}
              {isRequired && "*"}
            </FormLabel>
          )}
          <FormControl>
            <RadioGroup
              disabled={isDisabled}
              onValueChange={(value) =>
                handleValueChange(value, field.onChange)
              }
              defaultValue={
                typeof field.value === "object"
                  ? JSON.stringify(field.value)
                  : field.value
              }
              value={
                typeof field.value === "object"
                  ? JSON.stringify(field.value)
                  : field.value
              }
              className="gap-0"
            >
              {Children.map(children, (child, index) => (
                <FormItem
                  className={cn(
                    "mb-0 flex space-x-3 space-y-0 rounded-none border border-b-0 border-stone-200 p-4 text-sm first-of-type:rounded-t last-of-type:rounded-b last-of-type:border-b",
                    error && "bg-red-50 ring-red-300",
                    className,
                  )}
                >
                  <FormControl>
                    <RadioGroupItem
                      className="mt-0.5"
                      value={options[index].value}
                      id={`${name}_${index}`}
                      data-testid={`${name}_${index}`}
                      aria-label={t("common.option-label", {
                        index: index + 1,
                        value: options[index].value,
                      })}
                    />
                  </FormControl>
                  <FormLabel
                    className="flex w-full items-center font-normal text-slate-700"
                    htmlFor={`${name}_${index}`}
                  >
                    {child}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

// Мемоизация - используется для выбора способа оплаты, доставки
export const RadioFormGroup = memo(
  RadioFormGroupComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.name === nextProps.name &&
      prevProps.label === nextProps.label &&
      prevProps.isRequired === nextProps.isRequired &&
      prevProps.isDisabled === nextProps.isDisabled &&
      prevProps.isSrOnlyLabel === nextProps.isSrOnlyLabel &&
      prevProps.options.length === nextProps.options.length &&
      prevProps.className === nextProps.className
    );
  },
);
