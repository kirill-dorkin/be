"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import { type AllCountryCode } from "@nimara/domain/consts";
import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";
import {
  type AddressFormRow,
  type FieldType,
} from "@nimara/domain/objects/AddressForm";

import { usePathname, useRouter } from "@/i18n/routing";

import { AddressFormGenerator } from "./address-form-generator";

const dynamicFields: Array<keyof Address> = [
  "city",
  "postalCode",
  "cityArea",
  "streetAddress1",
  // "streetAddress2", // Убрано - не нужно второе поле адреса
  "countryArea",
];

const nameFormRow = [
  {
    name: "firstName",
    type: "text" as FieldType,
    isRequired: false,
  },
  {
    name: "lastName",
    type: "text" as FieldType,
    isRequired: false,
  },
];

const phoneCodeRow = [
  {
    name: "phone",
    type: "text" as FieldType,
    isRequired: false,
    inputMode: "tel",
  },
];

// Убрано поле companyName - не нужно для обычных покупателей
// const companyNameRow = [
//   {
//     name: "companyName",
//     type: "text" as FieldType,
//     isRequired: false,
//   },
// ];

interface AddressFormProps {
  addressFormRows: readonly AddressFormRow[];
  countries: CountryOption[];
  isDisabled?: boolean;
  onCountryChange?: (isChanging: boolean) => void;
  schemaPrefix?: string;
}

const AddressFormComponent = ({
  countries,
  addressFormRows,
  schemaPrefix,
  isDisabled,
  onCountryChange,
}: AddressFormProps) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const form = useFormContext();
  const [isChangingCountry, setIsChangingCountry] = useState(false);

  useEffect(() => {
    if (isChangingCountry && addressFormRows.length > 0) {
      setIsChangingCountry(false);
      onCountryChange?.(false);
    }
  }, [addressFormRows]);

  // Мемоизация обработчика изменения страны
  const handleChangeCountry = useCallback((countryCode: AllCountryCode) => {
    setIsChangingCountry(true);
    onCountryChange?.(true);
    dynamicFields.forEach((fieldName) =>
      form.resetField(fieldName, { defaultValue: "", keepError: false }),
    );
    router.push(`${pathname}?country=${countryCode}`, { scroll: false });
  }, [form, router, pathname, onCountryChange]);

  // Мемоизация селектора стран
  const countrySelectorFormRow = useMemo(() => [
    {
      name: "country",
      type: "select" as FieldType,
      isRequired: true,
      onChange: handleChangeCountry,
      options: countries.map((country) => ({
        value: country.value,
        label: country.label ?? country.value,
      })),
    },
  ], [countries, handleChangeCountry]);

  // Мемоизация отформатированных рядов формы
  const formattedAddressFormRows = useMemo(() => {
    let postalCode: AddressFormRow | undefined;
    let city: AddressFormRow | undefined;
    const result: AddressFormRow[] = [];

    addressFormRows.forEach((row) => {
      if (row[0].name === "city") {
        city = row;
      }

      if (row[0].name === "postalCode") {
        postalCode = row;
      }
    });

    addressFormRows.forEach((row) => {
      if (!["postalCode", "city"].includes(row[0].name)) {
        return result.push(row);
      }

      const isPostalRowHandled = result.some((r) =>
        ["postalCode", "city"].includes(r[0].name),
      );

      if (isPostalRowHandled) {
        return;
      }

      if (city && postalCode) {
        return result.push([...postalCode, ...city]);
      }

      if (!city && postalCode) {
        return result.push(postalCode);
      }

      if (city && !postalCode) {
        return result.push(city);
      }
    });

    return result;
  }, [addressFormRows]);

  return (
    <>
      <AddressFormGenerator
        isDisabled={isChangingCountry || isDisabled}
        schemaPrefix={schemaPrefix}
        addressFormRows={[
          nameFormRow,
          countrySelectorFormRow,
          phoneCodeRow,
        ]}
      />
      {isChangingCountry ? (
        <p>{t("shipping-address.loading-fields")}</p>
      ) : (
        <AddressFormGenerator
          isDisabled={isChangingCountry || isDisabled}
          schemaPrefix={schemaPrefix}
          addressFormRows={formattedAddressFormRows}
        />
      )}
    </>
  );
};

// Мемоизация - форма адреса
export const AddressForm = memo(AddressFormComponent, (prevProps, nextProps) => {
  return (
    prevProps.addressFormRows === nextProps.addressFormRows &&
    prevProps.countries.length === nextProps.countries.length &&
    prevProps.isDisabled === nextProps.isDisabled &&
    prevProps.schemaPrefix === nextProps.schemaPrefix
  );
});
