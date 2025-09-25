"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, Sparkles, Clock } from "lucide-react";

import ClientHeader from "@/widgets/header/ClientHeader";
import BaseContainer from "@/shared/ui/BaseContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/shared/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const highlights = [
    {
      icon: ShieldCheck,
      title: "Защищённый кабинет",
      description: "Шифруем данные, чтобы вход оставался безопасным даже из общественных пространств.",
    },
    {
      icon: Sparkles,
      title: "Персональные подборки",
      description: "Доступ к закрытым коллекциям техники и сопровождению кураторов бренда.",
    },
    {
      icon: Clock,
      title: "Быстрая поддержка",
      description: "Сервисная команда отвечает в течение рабочего часа после входа." ,
    },
  ];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const response = await signIn("credentials", { redirect: false, email, password });
      if (response?.error) {
        setError("Неверные данные для входа");
        showToast.error("Неверные данные для входа");
        return;
      }

      showToast.success("Вход выполнен успешно");

      const session = await getSession();
      if (session?.user?.role === "admin") {
        if (callbackUrl && callbackUrl.startsWith("/admin")) {
          router.push(callbackUrl);
        } else {
          router.push("/admin/dashboard");
        }
        return;
      }

      router.push(callbackUrl || "/");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Произошла ошибка при входе";
      setError(message);
      showToast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ClientHeader />
      <main className="relative flex min-h-screen flex-col overflow-hidden bg-white pt-[var(--header-height)]">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-16 top-24 h-80 w-80 rounded-full bg-[#f1f0ec]/70 blur-3xl" aria-hidden />
          <div className="absolute bottom-0 right-[-20%] h-[520px] w-[520px] rounded-full bg-neutral-100/70 blur-[160px]" aria-hidden />
        </div>
        <BaseContainer className="flex flex-1 flex-col justify-center py-24">
          <div className="grid gap-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,1fr)] lg:items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <span className="text-xs font-semibold uppercase tracking-[0.55em] text-neutral-400">Личный кабинет</span>
                <h1 className="text-[clamp(2.6rem,5vw,3.8rem)] font-light tracking-tight text-neutral-900">
                  Вход в BE Service Lab
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">
                  Авторизуйтесь, чтобы управлять заказами, контролировать обслуживание и получать закрытые подборки
                  техники. Доступ предоставляется только резидентам лаборатории и партнёрам бренда.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="rounded-[28px] border border-neutral-200/70 bg-white/80 px-6 py-5 shadow-[0_35px_120px_-110px_rgba(15,15,15,0.4)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/70 bg-neutral-50">
                        <Icon className="h-5 w-5 text-neutral-600" />
                      </span>
                      <p className="text-sm font-semibold text-neutral-900">{title}</p>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-neutral-500">{description}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[28px] border border-neutral-200/70 bg-neutral-50/80 px-6 py-5 text-sm text-neutral-500">
                <p className="font-medium text-neutral-900">Нет доступа?</p>
                <p>
                  Напишите нам в <Link href="/request" className="font-semibold text-neutral-900 underline-offset-4 hover:underline">форму обратной связи</Link>,
                  и менеджер подключит вас к системе.
                </p>
              </div>
            </div>

            <Card className="rounded-[36px] border border-neutral-200/70 bg-white/95 shadow-[0_55px_160px_-115px_rgba(15,15,15,0.5)] backdrop-blur">
              <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-2xl font-semibold text-neutral-900">Вход в аккаунт</CardTitle>
                <p className="text-sm text-neutral-500">
                  Чтобы продолжить, введите корпоративную почту и пароль, выданные куратором.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.45em] text-neutral-400">
                      Электронная почта
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="h-12 rounded-2xl border-neutral-200 bg-neutral-50/80 px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.45em] text-neutral-400">
                      Пароль
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Введите пароль"
                      className="h-12 rounded-2xl border-neutral-200 bg-neutral-50/80 px-4"
                    />
                  </div>
                  {error && (
                    <p className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-600">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full rounded-full text-xs font-semibold uppercase tracking-[0.45em]"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Входим...
                      </>
                    ) : (
                      "Войти"
                    )}
                  </Button>
                  <div className="text-center text-xs text-neutral-400">
                    Авторизуясь, вы соглашаетесь с правилами сервиса и политикой конфиденциальности.
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </BaseContainer>
      </main>
    </>
  );
}
