"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

import { UpdatePasswordForm } from "../_forms/update-password-form";

const UpdatePasswordModalComponent = () => {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  // Мемоизация обработчиков
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-slate-700 dark:text-primary"
          onClick={handleOpen}
        >
          {t("common.edit")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t("account.change-password")}</DialogTitle>
        </DialogHeader>
        <UpdatePasswordForm onModalClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

// Мемоизация - модальное окно обновления пароля
export const UpdatePasswordModal = memo(UpdatePasswordModalComponent);
