"use client";

import { Sparkles, Star, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "be-club-invite";
const SHOW_AFTER_MS = 7000;

type Benefit = {
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
};

export function ClubInviteModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (window.sessionStorage.getItem(STORAGE_KEY)) {
      return;
    }

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, SHOW_AFTER_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const benefits = useMemo<Benefit[]>(
    () => [
      {
        icon: Sparkles,
        title: "Скидки и подарки",
        description: "Экономьте до 20% на ремонте, доставке и аксессуарах.",
      },
      {
        icon: UsersRound,
        title: "Персональный сервис",
        description: "Чат с мастером, напоминания о ТО и быстрая поддержка 24/7.",
      },
      {
        icon: Star,
        title: "Ранний доступ",
        description: "Закрытые распродажи, лимитированные поставки и клубные акции.",
      },
    ],
    [],
  );

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
      <DialogContent className="max-w-[min(94vw,640px)] border-0 bg-gradient-to-b from-background to-muted/60 p-0 shadow-2xl">
        <div className="grid gap-0 overflow-hidden rounded-3xl bg-white dark:bg-stone-900 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 p-6 sm:p-8">
            <DialogHeader className="space-y-3 text-left">
              <DialogTitle className="text-2xl font-bold leading-tight sm:text-3xl">
                Вступайте в клуб BestElectronics
              </DialogTitle>
              <DialogDescription className="text-base leading-relaxed text-muted-foreground">
                Получайте привилегии участника: персональные скидки, ранний доступ к новинкам и
                поддержку сервисных инженеров тогда, когда это нужно.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 px-3 py-2 shadow-[0_6px_22px_rgba(15,23,42,0.07)]"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{benefit.title}</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-base shadow-lg shadow-amber-500/25"
                onClick={() => {
                  handleOpenChange(false);
                  router.push(paths.membership.asPath());
                }}
              >
                Стать участником
              </Button>
              <Button asChild variant="outline" className="flex-1 border-amber-200 text-base">
                <LocalizedLink href={paths.createAccount.asPath()} onClick={() => handleOpenChange(false)}>
                  Создать аккаунт
                </LocalizedLink>
              </Button>
            </div>
          </div>

          <div
            className={cn(
              "flex flex-col justify-between gap-6 p-6 sm:p-8",
              "bg-gradient-to-br from-amber-500 via-orange-500 to-orange-700 text-white",
            )}
          >
            <div className="space-y-4 text-sm sm:text-base">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70 sm:text-sm">
                для новых друзей
              </p>
              <p className="text-2xl font-semibold leading-tight sm:text-3xl">
                До 3 месяцев членства бесплатно
              </p>
              <p className="text-white/80">
                Получите приветственный бонус — бесплатное обслуживание техники, подбор аксессуаров и
                подарочный апгрейд выбранного гаджета.
              </p>
            </div>

            <ul className="space-y-2 text-sm text-white/90">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" />
                Бесплатные консультации инженеров
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" />
                Приоритетный ремонт и курьерская доставка
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" />
                Эксклюзивные клубные мероприятия и демо
              </li>
            </ul>

            <DialogClose asChild>
              <button className="text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline">
                Уже позже
              </button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
