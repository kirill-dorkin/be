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
import { Input, type InputProps } from "@nimara/ui/components/input";

export interface TextFormFieldProps extends Omit<InputProps, "onChange"> {
  isRequired?: boolean;
  label: string;
  onChange?: (value: string) => void;
}

function TextFormFieldComponent({
  label,
  name = "",
  isRequired = false,
  placeholder,
  onChange,
  type,
  ...props
}: TextFormFieldProps) {
  const { control } = useFormContext();
  const { error } = control.getFieldState(name);

  // Мемоизация обработчика изменения
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, fieldOnChange: (...event: any[]) => void) => {
    fieldOnChange(e);
    onChange?.(e.target.value);
  }, [onChange]);

  return (
    <FormField
      key={name}
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className="flex-1">
            <FormLabel htmlFor={name}>
              {label}
              {isRequired && "*"}
            </FormLabel>
            <FormControl>
              <div className="flex">
                <Input
                  aria-label={label}
                  placeholder={placeholder}
                  {...field}
                  value={field?.value ?? ""}
                  onChange={(e) => handleChange(e, field.onChange)}
                  type={type}
                  error={!!error}
                  {...props}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// Мемоизация - используется в формах адресов, чекаута
export const TextFormField = memo(TextFormFieldComponent, (prevProps, nextProps) => {
  return (
    prevProps.name === nextProps.name &&
    prevProps.label === nextProps.label &&
    prevProps.isRequired === nextProps.isRequired &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.type === nextProps.type &&
    prevProps.disabled === nextProps.disabled
  );
});
