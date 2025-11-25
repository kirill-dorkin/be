import { getTranslations } from "next-intl/server";

import { type User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

import { UpdateEmailForm } from "../_forms/update-email-form";

export async function UpdateEmailModal({ user }: { user: User }) {
  const t = await getTranslations();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-2xl border-slate-200 text-center text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-primary dark:hover:border-slate-600 md:w-auto"
        >
          {t("common.edit")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t("account.change-email")}</DialogTitle>
        </DialogHeader>
        <UpdateEmailForm oldEmail={user.email} />
      </DialogContent>
    </Dialog>
  );
}
