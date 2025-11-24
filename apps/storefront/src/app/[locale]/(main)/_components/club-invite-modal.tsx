"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@nimara/ui/components/dialog";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

const STORAGE_KEY = "be-club-invite";
const INITIAL_DELAY_MS = 40_000;
const REMINDER_DELAY_MS = 5 * 60_000;

type ClubInviteModalProps = {
  isAuthenticated: boolean;
};

export function ClubInviteModal({ isAuthenticated }: ClubInviteModalProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);

  const clearScheduledShow = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setNextShowTimestamp = useCallback((timestamp: number | null) => {
    if (typeof window === "undefined") {
      return;
    }

    if (timestamp === null) {
      window.sessionStorage.removeItem(STORAGE_KEY);

      return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, String(timestamp));
  }, []);

  const scheduleShow = useCallback(
    (delay: number) => {
      if (typeof window === "undefined") {
        return;
      }

      clearScheduledShow();

      if (delay <= 0) {
        setNextShowTimestamp(null);
        setOpen(true);

        return;
      }

      const nextShowAt = Date.now() + delay;

      setNextShowTimestamp(nextShowAt);

      timeoutRef.current = window.setTimeout(() => {
        setNextShowTimestamp(null);
        setOpen(true);
        timeoutRef.current = null;
      }, delay);
    },
    [clearScheduledShow, setNextShowTimestamp, setOpen],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (isAuthenticated) {
      setOpen(false);
      clearScheduledShow();
      setNextShowTimestamp(null);

      return;
    }

    // Resume any pending schedule so the modal timing survives navigation.
    const storedValue = window.sessionStorage.getItem(STORAGE_KEY);
    let delay = INITIAL_DELAY_MS;

    if (storedValue) {
      const parsed = Number(storedValue);

      if (Number.isFinite(parsed)) {
        delay = Math.max(parsed - Date.now(), 0);
      } else {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    scheduleShow(delay);

    return () => {
      clearScheduledShow();
    };
  }, [isAuthenticated, scheduleShow, clearScheduledShow, setNextShowTimestamp]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);

    if (next) {
      clearScheduledShow();
      setNextShowTimestamp(null);

      return;
    }

    if (!isAuthenticated) {
      scheduleShow(REMINDER_DELAY_MS);
    }
  };

  if (isAuthenticated || !open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        withCloseButton={false}
        className="max-w-[min(92vw,360px)] rounded-[32px] border-0 bg-white p-0 shadow-[0_40px_120px_rgba(15,23,42,0.35)] dark:bg-stone-900"
      >
        <DialogTitle className="sr-only">Вступить в клуб</DialogTitle>
        <div className="relative flex flex-col gap-6 px-5 pb-6 pt-10">
          <div className="space-y-4 rounded-3xl bg-muted/30 p-4">
            <div className="rounded-2xl bg-slate-900 text-white">
              <Button
                className="h-12 w-full rounded-2xl bg-transparent text-base font-semibold text-white !transition-none hover:!bg-transparent focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 active:!scale-100"
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
                className="h-12 w-full rounded-2xl bg-transparent text-base font-semibold text-slate-900 !transition-none hover:!bg-transparent focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 active:!scale-100"
              >
                <LocalizedLink
                  href={paths.createAccount.asPath()}
                  onClick={() => handleOpenChange(false)}
                >
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
