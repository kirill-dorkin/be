"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@nimara/ui/components/dialog";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

const STORAGE_KEY = "be-club-invite";

export function ClubInviteModal() {
  // TODO: вернуть отложенное появление по таймеру после финализации дизайна попапа
  const [open, setOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);

    if (!next && typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, "seen");
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[min(92vw,360px)] rounded-[32px] border-0 bg-white p-0 shadow-[0_40px_120px_rgba(15,23,42,0.35)] dark:bg-stone-900">
        <div className="relative flex flex-col gap-6 px-5 pb-6 pt-6">

          <div className="space-y-4 rounded-3xl bg-muted/30 p-4">
            <div className="rounded-2xl bg-slate-900 text-white">
              <Button
                className="h-12 w-full rounded-2xl bg-transparent text-base font-semibold text-white hover:bg-white/10"
                onClick={() => {
                  handleOpenChange(false);
                  router.push(paths.membership.asPath());
                }}
              >
                Вступить в клуб
              </Button>
            </div>
            <div className="rounded-2xl bg-white shadow-sm shadow-slate-200">
              <Button
                asChild
                variant="ghost"
                className="h-12 w-full rounded-2xl text-base font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                <LocalizedLink href={paths.createAccount.asPath()} onClick={() => handleOpenChange(false)}>
                  Зарегистрироваться
                </LocalizedLink>
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Уже есть аккаунт? Просто войдите — все преимущества сохранятся.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
