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
          size="sm"
          className="w-full rounded-2xl border-slate-200 text-center text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-primary dark:hover:border-slate-600 md:w-auto"
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
