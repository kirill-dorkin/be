"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useCallback, useEffect, useState } from "react";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { Button, type ButtonProps } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

import { useRouter } from "@/i18n/routing";
import { paths } from "@/lib/paths";

import { AddNewAddressForm } from "../_forms/create-address-form";

interface AddNewAddressModalProps {
  addressFormRows: readonly AddressFormRow[];
  buttonContent: React.ReactNode;
  buttonProps?: ButtonProps;
  countries: CountryOption[];
  countryCode: AllCountryCode;
}

const AddNewAddressModalComponent = ({
  addressFormRows,
  buttonContent,
  buttonProps,
  countries,
  countryCode,
}: AddNewAddressModalProps) => {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("country")) {
      router.push(paths.account.addresses.asPath());
    }
  }, [isOpen]);

  // Мемоизация обработчика закрытия
  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button {...buttonProps}>{buttonContent}</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t("address.add-new-address")}</DialogTitle>
        </DialogHeader>
        <AddNewAddressForm
          addressFormRows={addressFormRows}
          countries={countries}
          countryCode={countryCode}
          onModalClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

// Мемоизация - модальное окно добавления адреса
export const AddNewAddressModal = memo(AddNewAddressModalComponent, (prevProps, nextProps) => {
  return (
    prevProps.addressFormRows === nextProps.addressFormRows &&
    prevProps.countries.length === nextProps.countries.length &&
    prevProps.countryCode === nextProps.countryCode
  );
});
