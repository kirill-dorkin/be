"use client";

import { Crown, MessageCircle, Sparkles } from "lucide-react";
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

const STORAGE_KEY = "be-club-invite";

type Benefit = {
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
};

export function ClubInviteModal() {
  // TODO: вернуть отложенное появление по таймеру после финализации дизайна попапа
  const [open, setOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const benefits = useMemo<Benefit[]>(
    () => [
      {
        icon: Sparkles,
        title: "Скидка до 20%",
        description: "К каждому ремонту и доставке",
      },
      {
        icon: Crown,
        title: "Приоритет 24/7",
        description: "Личный специалист всегда на связи",
      },
      {
        icon: MessageCircle,
        title: "Закрытые акции",
        description: "Новинки и апгрейды только для клуба",
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
      <DialogContent className="max-w-[min(90vw,420px)] rounded-[32px] border-0 bg-white p-0 shadow-[0_40px_120px_rgba(15,23,42,0.35)] dark:bg-stone-900">
        <div className="relative flex flex-col gap-6 px-6 pb-6 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogHeader className="text-left">
                <DialogTitle className="text-[22px] font-semibold leading-tight">
                  Клуб BestElectronics
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Несколько бонусов, которые вы получите за регистрацию.
                </DialogDescription>
              </DialogHeader>
            </div>
            <DialogClose asChild>
              <button className="h-9 w-9 rounded-full bg-muted text-muted-foreground transition hover:bg-muted/80">
                ×
              </button>
            </DialogClose>
          </div>

          <div className="space-y-2">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/40 px-3 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <benefit.icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{benefit.title}</span>
                  <span className="text-xs text-muted-foreground">{benefit.description}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className="h-11 rounded-2xl bg-slate-900 text-base font-semibold text-white transition hover:bg-slate-800"
              onClick={() => {
                handleOpenChange(false);
                router.push(paths.membership.asPath());
              }}
            >
              Вступить в клуб
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-11 rounded-2xl border border-transparent bg-muted/60 text-base font-semibold text-foreground transition hover:bg-muted"
            >
              <LocalizedLink href={paths.createAccount.asPath()} onClick={() => handleOpenChange(false)}>
                Зарегистрироваться
              </LocalizedLink>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Уже есть аккаунт? Просто войдите — все клубные преимущества сохранятся.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
