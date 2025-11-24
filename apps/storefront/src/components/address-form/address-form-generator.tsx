import { type CountryCode } from "libphonenumber-js";
import { useTranslations } from "next-intl";

import {
  type AddressFormField,
  type AddressFormRow,
} from "@nimara/domain/objects/AddressForm";

import { AddressAutocompleteFormField } from "@/components/form/address-autocomplete-form-field";
import { PhoneInputFormField } from "@/components/form/phone-input-form-field";
import { SelectFormField } from "@/components/form/select-form-field";
import { TextFormField } from "@/components/form/text-form-field";
import { generateFieldPrefix } from "@/lib/form/utils";
import { type AddressSuggestion } from "@/lib/hooks/use-address-autocomplete";
import { cn } from "@/lib/utils";
import { type GetTranslations, type TranslationMessage } from "@/types";

const renderInput = ({
  field,
  t,
  schemaPrefix,
  isDisabled = false,
  countryCode,
  locale,
  onAddressSelect,
}: {
  countryCode?: string;
  field: AddressFormField;
  isDisabled?: boolean;
  locale?: string;
  onAddressSelect?: (suggestion: AddressSuggestion) => void;
  schemaPrefix?: string;
  t: GetTranslations<"address">;
}) => {
  const withSchemaPrefix = generateFieldPrefix(schemaPrefix);

  const localField = {
    ...field,
    disabled: isDisabled,
    name: withSchemaPrefix(field.name),
    label: t((field.label ?? field.name) as TranslationMessage<"address">),
  };

  // Используем специальный компонент для телефона
  if (field.name === "phone") {
    const placeholderKey = `${field.name}-placeholder` as TranslationMessage<"address">;
    const placeholder = t(placeholderKey);

    return (
      <PhoneInputFormField
        {...localField}
        placeholder={placeholder}
        countryCode={countryCode as CountryCode}
      />
    );
  }

  // Используем автокомплит для поля адреса
  if (field.name === "streetAddress1") {
    const placeholderKey = `${field.name}-placeholder` as TranslationMessage<"address">;
    const placeholder = t(placeholderKey);

    return (
      <AddressAutocompleteFormField
        {...localField}
        placeholder={placeholder}
        countryCode={countryCode}
        locale={locale}
        onAddressSelect={onAddressSelect}
      />
    );
  }

  switch (field.type) {
    case "select":
      return <SelectFormField {...localField} />;
    case "text": {
      // Добавляем placeholder только для текстовых полей
      const placeholderKey = `${field.name}-placeholder` as TranslationMessage<"address">;
      const placeholder = t(placeholderKey);

      return <TextFormField {...localField} placeholder={placeholder} />;
    }
    default:
      // according to docs https://github.com/typescript-eslint/typescript-eslint/issues/3069
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unknown input type: ${field.type}`);
  }
};

export const AddressFormGenerator = ({
  addressFormRows,
  schemaPrefix,
  isDisabled,
  countryCode,
  locale,
  onAddressSelect,
}: {
  addressFormRows: AddressFormRow[];
  countryCode?: string;
  isDisabled?: boolean;
  locale?: string;
  onAddressSelect?: (suggestion: AddressSuggestion) => void;
  schemaPrefix?: string;
}) => {
  const t = useTranslations("address");

  return (
    <div
      className={cn("space-y-2", {
        "pointer-events-none opacity-70 [&_button]:bg-stone-50 [&_input]:bg-stone-50":
          isDisabled,
      })}
    >
      {addressFormRows.map((formRow) => (
        <div key={formRow[0].name} className="flex gap-2">
          {formRow.map((field) => (
            <div className="w-full" key={field.name}>
              {renderInput({
                field,
                t,
                schemaPrefix,
                isDisabled,
                countryCode,
                locale,
                onAddressSelect,
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
