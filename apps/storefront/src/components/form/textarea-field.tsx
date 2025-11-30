"use client";

import { memo } from "react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from "@nimara/ui/components/form";
import { cn } from "@nimara/ui/lib/utils";

export type TextareaFieldProps = {
  className?: string;
  isRequired?: boolean;
  label: string;
  maxLength?: number;
  name: string;
  placeholder?: string;
  rows?: number;
};

const TextareaFieldComponent = ({
  className,
  isRequired = false,
  label,
  maxLength,
  name,
  placeholder,
  rows = 4,
}: TextareaFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn("grid gap-2", className)}>
          <FormLabel htmlFor={name}>
            {label}
            {isRequired && "*"}
          </FormLabel>
          <FormControl>
            <textarea
              id={name}
              {...field}
              className={cn(
                "border-input bg-background placeholder:text-muted-foreground flex min-h-[160px] w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                fieldState.invalid &&
                  "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/30",
              )}
              placeholder={placeholder}
              rows={rows}
              maxLength={maxLength}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

// Мемоизация - используется в формах обратной связи, комментариев
export const TextareaField = memo(
  TextareaFieldComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.name === nextProps.name &&
      prevProps.label === nextProps.label &&
      prevProps.isRequired === nextProps.isRequired &&
      prevProps.placeholder === nextProps.placeholder &&
      prevProps.maxLength === nextProps.maxLength &&
      prevProps.rows === nextProps.rows &&
      prevProps.className === nextProps.className
    );
  },
);
