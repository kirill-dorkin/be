"use client";

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

export const TextareaField = ({
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
      render={({ field }) => (
        <FormItem className={cn("grid gap-2", className)}>
          <FormLabel htmlFor={name}>
            {label}
            {isRequired && "*"}
          </FormLabel>
          <FormControl>
            <textarea
              id={name}
              {...field}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[160px] w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
