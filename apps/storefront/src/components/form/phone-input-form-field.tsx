"use client";

import { type CountryCode } from "libphonenumber-js";
import { memo, useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nimara/ui/components/form";
import { cn } from "@nimara/ui/lib/utils";

export interface PhoneInputFormFieldProps {
  countryCode?: CountryCode;
  isRequired?: boolean;
  label: string;
  name?: string;
  placeholder?: string;
}

const COUNTRY_CODES: Partial<Record<CountryCode, string>> = {
  KG: "+996",
  RU: "+7",
  US: "+1",
  GB: "+44",
};

function PhoneInputFormFieldComponent({
  label,
  name = "phone",
  isRequired = false,
  placeholder,
  countryCode = "KG",
}: PhoneInputFormFieldProps) {
  const { control, clearErrors } = useFormContext();
  const [prefix] = useState(() => COUNTRY_CODES[countryCode] || "+996");

  // Форматируем только номер БЕЗ кода страны
  const formatPhoneNumber = useCallback(
    (value: string): string => {
      if (!value) {
        return "";
      }

      // Убираем все кроме цифр
      const cleaned = value.replace(/\D/g, "");

      // Форматируем с пробелами (для кыргызстана: XXX XX XX XX)
      if (countryCode === "KG") {
        return cleaned
          .replace(/^(\d{3})(\d)/, "$1 $2")
          .replace(/^(\d{3}) (\d{2})(\d)/, "$1 $2 $3")
          .replace(/^(\d{3}) (\d{2}) (\d{2})(\d)/, "$1 $2 $3 $4");
      }

      // Для других стран - простое форматирование
      return cleaned
        .replace(/(\d{3})(\d)/, "$1 $2")
        .replace(/(\d{3}) (\d{3})(\d)/, "$1 $2 $3");
    },
    [countryCode],
  );

  return (
    <FormField
      key={name}
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Получаем флаг ошибки из fieldState
        const hasError = fieldState.invalid;

        // Мемоизация обработчика изменения
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let value = e.target.value;

          // Убираем все кроме цифр
          value = value.replace(/\D/g, "");

          // Ограничиваем количество цифр (для KG - 9 цифр)
          const maxLength = countryCode === "KG" ? 9 : 15;

          if (value.length > maxLength) {
            value = value.slice(0, maxLength);
          }

          // ВАЖНО: Сохраняем пустую строку если пользователь ничего не ввел
          // Иначе валидация не сработает (будет сохранен только префикс +996)
          const fullPhoneNumber = value.length > 0 ? `${prefix}${value}` : "";

          field.onChange(fullPhoneNumber);

          // Плавно убираем ошибку через небольшую задержку
          if (hasError && value.length > 0) {
            setTimeout(() => {
              clearErrors(name);
            }, 100);
          }
        };

        // Получаем отображаемое значение (без кода страны)
        const rawValue = typeof field.value === "string" ? field.value : "";
        const displayValue = rawValue
          ? rawValue.startsWith(prefix)
            ? formatPhoneNumber(rawValue.slice(prefix.length))
            : formatPhoneNumber(rawValue)
          : "";

        return (
          <FormItem className="flex-1">
            <FormLabel htmlFor={name}>
              {label}
              {isRequired && <span className="text-red-500">*</span>}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <div
                  className={cn(
                    "pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 select-none items-center gap-2 transition-all duration-500 ease-in-out",
                    hasError
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground",
                  )}
                >
                  <span className="text-sm font-medium">{prefix}</span>
                  <div
                    className={cn(
                      "mx-0.5 h-4 w-px transition-all duration-500 ease-in-out",
                      hasError ? "bg-red-400 dark:bg-red-600" : "bg-border",
                    )}
                  />
                </div>
                <input
                  aria-label={label}
                  placeholder={placeholder || "555 12 34 56"}
                  value={displayValue}
                  onChange={handleChange}
                  type="tel"
                  className={cn(
                    "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-all duration-500 ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    "placeholder:text-muted-foreground pl-[4rem]",
                    hasError
                      ? "border-red-500 bg-red-50 autofill:!bg-red-50 dark:border-red-500 dark:bg-red-900/30 dark:autofill:!bg-red-900/30"
                      : "border-input bg-background",
                  )}
                  inputMode="tel"
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

// Мемоизация
export const PhoneInputFormField = memo(
  PhoneInputFormFieldComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.name === nextProps.name &&
      prevProps.label === nextProps.label &&
      prevProps.isRequired === nextProps.isRequired &&
      prevProps.placeholder === nextProps.placeholder &&
      prevProps.countryCode === nextProps.countryCode
    );
  },
);
