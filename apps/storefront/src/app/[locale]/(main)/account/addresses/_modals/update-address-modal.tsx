"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, type ReactNode, useCallback, useMemo, useState } from "react";

import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";
import { useToast } from "@nimara/ui/hooks";

import { usePathname, useRouter } from "@/i18n/routing";
import { storefrontLogger } from "@/services/logging";

import { deleteAddress } from "../_forms/actions";
import { EditAddressForm } from "../_forms/update-address-form";

interface AddNewAddressModalProps {
  address: Address;
  addressFormRows: readonly AddressFormRow[];
  countries: CountryOption[];
}

const EditAddressModalComponent = ({
  address,
  addressFormRows,
  countries,
}: AddNewAddressModalProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const t = useTranslations();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mode, setMode] = useState<"UPDATE" | "DELETE">("UPDATE");

  // Мемоизация params
  useMemo(
    () => params.set("country", address.country),
    [params, address.country],
  );

  // Мемоизация обработчика удаления адреса
  const handleAddressDelete = useCallback(async () => {
    setIsDeleting(true);
    const result = await deleteAddress(address.id);

    if (!result.ok) {
      storefrontLogger.error("Failed to delete address", { result });

      return;
    }

    setIsDeleting(false);
    setIsOpen(false);
    toast({
      position: "center",
      description: t("address.address-has-been-removed"),
    });
  }, [address.id, toast, t]);

  // Мемоизация content
  const content: ReactNode = useMemo(() => {
    if (mode === "UPDATE") {
      return (
        <>
          <DialogHeader>
            <DialogTitle>{t("address.edit-address")}</DialogTitle>
          </DialogHeader>
          <EditAddressForm
            address={address}
            addressFormRows={addressFormRows}
            countries={countries}
            onModalClose={() => setIsOpen(false)}
            onModeChange={() => setMode("DELETE")}
          />
        </>
      );
    } else {
      return (
        <>
          <DialogHeader>
            <DialogTitle>{t("address.delete-address")}</DialogTitle>
            <DialogDescription className="dark:text-muted-foreground text-sm text-stone-700">
              {t("address.delete-address-description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4">
            <Button
              loading={isDeleting}
              disabled={isDeleting}
              onClick={handleAddressDelete}
            >
              {isDeleting ? t("common.please-wait") : t("common.delete")}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setMode("UPDATE")}>
                {t("common.cancel")}
              </Button>
            </DialogClose>
          </div>
        </>
      );
    }
  }, [
    mode,
    t,
    address,
    addressFormRows,
    countries,
    isDeleting,
    handleAddressDelete,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => router.push(`${pathname}?${params.toString()}`)}
        >
          {t("common.edit")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        {...(mode === "UPDATE" ? { "aria-describedby": undefined } : {})}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
};

// Мемоизация - модальное окно редактирования адреса
export const EditAddressModal = memo(
  EditAddressModalComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.address.id === nextProps.address.id &&
      prevProps.addressFormRows === nextProps.addressFormRows
    );
  },
);
