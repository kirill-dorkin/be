"use client";
import Image from "next/image";
import { signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


import { Button } from "@/components/ui/button";
import { usePerformance } from "@/shared/lib/usePerformance";
import { Section } from "@/shared/ui/launchui";

import OptimizedLink from "@/shared/ui/OptimizedLink";

const Hero: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();
  
  // Инициализируем хук производительности
  usePerformance();

  
  const handleLogout = () => {
    signOut();
  };

  return (
    <Section
      id="hero"
      className="relative isolate flex min-h-screen items-center overflow-hidden px-6 py-24 sm:px-12 md:py-28 lg:px-24 lg:py-32"
    >
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#f9f9f7] via-white to-[#f2f1ef]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75)_0%,_rgba(242,241,239,0)_65%)]" />
      <div className="absolute left-1/3 top-[-20%] -z-10 h-[60vh] w-[60vw] rounded-full bg-white/60 blur-3xl" />

      <div className="relative z-10 grid w-full gap-16 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)] lg:items-center">
        <div className="flex flex-col gap-12 text-left">
          <div className="flex flex-col gap-8">
            <span className="text-xs font-semibold uppercase tracking-[0.6em] text-neutral-500">
              Premium Service Lab
            </span>
            <h1 className="text-5xl font-light tracking-tight text-neutral-900 sm:text-6xl md:text-7xl lg:text-[5.25rem] lg:leading-[0.95]">
              Сервис электроники класса люкс
            </h1>
            <p className="max-w-xl text-base text-neutral-500 sm:text-lg md:text-xl">
              Обслуживаем устройства премиум-сегмента с инженерной точностью и спокойной уверенностью. Мы создаём ощущение новой жизни техники, сохраняя её индивидуальность.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {!isLoggedIn ? (
              <>
                <OptimizedLink href="/request" prefetch priority>
                  <Button
                    size="lg"
                    className="h-14 rounded-full px-10 text-xs font-semibold uppercase tracking-[0.4em] text-neutral-100 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_25px_60px_-40px_rgba(16,16,16,0.45)]"
                  >
                    Заказать сервис
                  </Button>
                </OptimizedLink>
                <OptimizedLink href="/shop" prefetch>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-14 rounded-full px-10 text-xs font-semibold uppercase tracking-[0.4em] text-neutral-600 transition-colors hover:text-neutral-900"
                  >
                    Каталог устройств
                  </Button>
                </OptimizedLink>
              </>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="h-14 rounded-full px-10 text-xs font-semibold uppercase tracking-[0.4em] text-neutral-100 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_25px_60px_-40px_rgba(16,16,16,0.45)]"
                  onClick={handleGoToDashboard}
                >
                  Перейти в панель
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-14 rounded-full px-10 text-xs font-semibold uppercase tracking-[0.4em] text-neutral-600 transition-colors hover:text-neutral-900"
                  onClick={handleLogout}
                >
                  Выйти
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="relative w-full">
          <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[48px] border border-white/50 bg-gradient-to-br from-white via-white to-[#e4e3e1] shadow-[0_60px_160px_-80px_rgba(15,15,15,0.7)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9)_0%,_rgba(255,255,255,0)_70%)] opacity-60" />
            <Image
              src="/images/optimized/tablets-lined-up-display-shopping-mall-xl.webp"
              alt="Премиальный союз техники и дизайна"
              fill
              priority
              sizes="(min-width: 1280px) 560px, (min-width: 768px) 50vw, 90vw"
              className="animate-hero-float object-cover object-center transition-transform duration-[4000ms] ease-out group-hover:scale-[1.025]"
            />
          </div>

          <div className="absolute -left-10 bottom-10 hidden min-w-[220px] items-center gap-3 rounded-full border border-white/60 bg-white/70 px-6 py-4 text-left backdrop-blur-lg md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-[0.45em] text-neutral-500">
                Signature Care
              </span>
              <span className="text-sm font-semibold text-neutral-700">
                72 часа на полную диагностику устройства
              </span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Hero;
