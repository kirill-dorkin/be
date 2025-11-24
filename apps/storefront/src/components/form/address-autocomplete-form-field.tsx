"use client";

import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@nimara/ui/components/form";

import { type AddressSuggestion } from "@/lib/hooks/use-address-autocomplete";

import { AddressAutocompleteInput } from "../address-form/address-autocomplete-input";

export type AddressAutocompleteFormFieldProps = {
  name: string;
  label: string;
  placeholder?: string;
  isRequired?: boolean;
  disabled?: boolean;
  countryCode?: string;
  locale?: string;
  onAddressSelect?: (suggestion: AddressSuggestion) => void;
};

export const AddressAutocompleteFormField = ({
  name,
  label,
  placeholder,
  isRequired = false,
  disabled = false,
  countryCode,
  locale,
  onAddressSelect,
}: AddressAutocompleteFormFieldProps) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          field.onChange(e);

          // Плавно убираем ошибку через небольшую задержку для плавности анимации
          if (fieldState.error && e.target.value) {
            setTimeout(() => {
              form.clearErrors(name);
            }, 100);
          }
        };

        return (
          <FormItem>
            <FormLabel>
              {label}
              {isRequired && <span className="text-red-500">*</span>}
            </FormLabel>
            <FormControl>
              <AddressAutocompleteInput
                {...field}
                label={label}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                error={!!fieldState.error}
                countryCode={countryCode}
                locale={locale}
                onAddressSelect={onAddressSelect}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
