"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { Loader2, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Input } from "@nimara/ui/components/input";
import { cn } from "@nimara/ui/lib/utils";

import { type AddressSuggestion, useAddressAutocomplete } from "@/lib/hooks/use-address-autocomplete";

type AddressAutocompleteInputProps = {
  countryCode?: string;
  disabled?: boolean;
  error?: boolean;
  label: string;
  locale?: string;
  name: string;
  onAddressSelect?: (suggestion: AddressSuggestion) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value?: string;
};

export const AddressAutocompleteInput = ({
  name,
  label: _label,
  placeholder,
  countryCode,
  locale,
  onAddressSelect,
  onChange: externalOnChange,
  disabled,
  error,
  value: externalValue,
}: AddressAutocompleteInputProps) => {
  const { setValue, watch, clearErrors } = useFormContext();
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedValue = useDebounce(inputValue, 500);

  const { suggestions, isLoading, searchAddress } = useAddressAutocomplete(
    countryCode,
    locale,
  );

  const fieldValue = watch<string | undefined>(name);

  useEffect(() => {
    if (fieldValue && fieldValue !== inputValue) {
      setInputValue(fieldValue);
    }
  }, [fieldValue]);

  useEffect(() => {
    if (
      typeof externalValue === "string" &&
      externalValue.length > 0 &&
      externalValue !== inputValue
    ) {
      setInputValue(externalValue);
      setValue(name, externalValue);
    }
  }, [externalValue, inputValue, name, setValue]);

  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 3) {
      void searchAddress(debouncedValue);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedValue, searchAddress]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setInputValue(value);
    setValue(name, value);

    // Вызываем внешний onChange если он есть
    externalOnChange?.(e);

    // Плавно убираем ошибку через небольшую задержку для плавности анимации
    if (error && value) {
      setTimeout(() => {
        clearErrors(name);
      }, 100);
    }
  }, [name, setValue, error, clearErrors, externalOnChange]);

  const handleSelectSuggestion = useCallback((suggestion: AddressSuggestion) => {
    // Формируем адрес только из улицы и номера дома
    const streetAddress = [suggestion.street, suggestion.houseNumber]
      .filter(Boolean)
      .join(", ");

    const displayValue = streetAddress || suggestion.displayName;

    setInputValue(displayValue);
    setValue(name, displayValue);
    setShowSuggestions(false);
    onAddressSelect?.(suggestion);
  }, [name, setValue, onAddressSelect]);

  const handleBlur = useCallback(() => {
    // Задержка чтобы клик по подсказке успел сработать
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          id={name}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          error={error}
          className="pr-8"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto p-1">
            {suggestions.map((suggestion, index) => {
              // Формируем красивое отображение адреса
              const mainAddress = [suggestion.street, suggestion.houseNumber]
                .filter(Boolean)
                .join(", ");
              const secondaryAddress = [suggestion.city, suggestion.state]
                .filter(Boolean)
                .join(", ");

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-sm px-3 py-2 text-left transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  )}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 break-words">
                    <div className="text-sm font-medium">
                      {mainAddress || suggestion.displayName}
                    </div>
                    {secondaryAddress && (
                      <div className="text-xs text-muted-foreground">
                        {secondaryAddress}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
