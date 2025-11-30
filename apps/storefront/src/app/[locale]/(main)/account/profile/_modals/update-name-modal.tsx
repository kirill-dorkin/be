"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback, useState } from "react";

import { type User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

import { UpdateNameForm } from "../_forms/update-name-form";

const UpdateNameModalComponent = ({ user }: { user: User | null }) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  // Мемоизация обработчика закрытия
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="dark:text-primary w-full rounded-2xl border-slate-200 text-center text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 md:w-auto dark:border-slate-700 dark:hover:border-slate-600"
        >
          {t("common.edit")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("account.change-your-name")}</DialogTitle>
        </DialogHeader>
        <UpdateNameForm user={user} onModalClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

// Мемоизация - модальное окно обновления имени
export const UpdateNameModal = memo(
  UpdateNameModalComponent,
  (prevProps, nextProps) => {
    return prevProps.user?.id === nextProps.user?.id;
  },
);
