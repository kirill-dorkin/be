"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@nimara/ui/components/button";
import { Checkbox } from "@nimara/ui/components/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";
import { Label } from "@nimara/ui/components/label";
import { Spinner } from "@nimara/ui/components/spinner";

import { clientEnvs } from "@/envs/client";
import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

import { requestUserAccountDeletion } from "./actions";

const DELETE_ACCOUNT = "deleteAccount";

export function DeleteAccountModal() {
  const t = useTranslations();

  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isDeleteAccountChecked, setIsDeleteAccountChecked] = useState(false);

  let content: ReactNode;

  if (searchParams.get("emailSent")) {
    content = (
      <>
        <DialogHeader>
          <DialogTitle>{t("account.confirm-account-deletion")}</DialogTitle>
          <DialogDescription className="dark:text-muted-foreground text-sm text-stone-500">
            {t("account.confirm-account-deletion-description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <DialogClose asChild className="mt-4 w-full">
            <Button asChild>
              <LocalizedLink href={paths.account.privacySettings.asPath()}>
                {t("account.ok-i-will-check-my-email")}
              </LocalizedLink>
            </Button>
          </DialogClose>
        </DialogFooter>
      </>
    );
  } else {
    content = (
      <>
        <DialogHeader>
          <DialogTitle>{t("account.delete-account")}</DialogTitle>
          <DialogDescription className="dark:text-muted-foreground text-sm text-stone-500">
            {t("account.delete-account-modal-description")}{" "}
            {t.rich("account.in-case-of-any-questions", {
              contactUs: () => (
                <LocalizedLink
                  href={`mailto:${clientEnvs.NEXT_PUBLIC_DEFAULT_EMAIL}`}
                  className="underline decoration-gray-400 underline-offset-2 dark:decoration-gray-300"
                  target="_blank"
                >
                  {t("common.contact-us")}
                </LocalizedLink>
              ),
              privacyPolicy: () => (
                <LocalizedLink
                  href={paths.privacyPolicy.asPath()}
                  className="underline decoration-gray-400 underline-offset-2 dark:decoration-gray-300"
                >
                  {t("common.privacy-policy")}
                </LocalizedLink>
              ),
            })}
          </DialogDescription>
        </DialogHeader>
        {searchParams.get("error") ? (
          <p className="destructive mt-6 text-sm">
            {t("errors.account.deleteAccount")}
          </p>
        ) : (
          <form action={requestUserAccountDeletion} className="mt-6 space-y-6">
            <div className="flex w-full gap-2">
              <Checkbox
                checked={isDeleteAccountChecked}
                onCheckedChange={() =>
                  setIsDeleteAccountChecked(!isDeleteAccountChecked)
                }
                className="mt-1"
                id={DELETE_ACCOUNT}
                name={DELETE_ACCOUNT}
              />
              <Label className="!leading-5" htmlFor={DELETE_ACCOUNT}>
                {t(
                  "account.i-want-permanently-delete-my-account-and-all-data-from-store",
                )}
              </Label>
            </div>
            <DialogFooter>
              <SubmitButton disabled={!isDeleteAccountChecked} />
            </DialogFooter>
          </form>
        )}
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">{t("account.delete-account")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">{content}</DialogContent>
    </Dialog>
  );
}

function SubmitButton({ disabled }: Pick<ButtonProps, "disabled">) {
  const t = useTranslations();
  const { pending } = useFormStatus();

  return (
    <Button
      className="mt-4 w-full"
      disabled={disabled || pending}
      variant="destructive"
      type="submit"
    >
      {pending ? (
        <span className="inline-flex items-center">
          <Spinner className="mr-2 h-4 w-4 text-white" />
          {t("common.please-wait")}
        </span>
      ) : (
        t("account.delete-account")
      )}
    </Button>
  );
}
