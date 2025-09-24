"use client";

import Image from "next/image";

import { Section } from "@/shared/ui/launchui";

const gallery = [
  {
    src: "/images/optimized/laptop-store-desktop.jpg",
    alt: "Пространство ателье Best Electronics",
  },
  {
    src: "/images/optimized/tablets-lined-up-display-shopping-mall-desktop.jpg",
    alt: "Зона выдачи устройств",
  },
];

export default function AtelierExperience() {
  return (
    <Section
      id="atelier"
      className="relative isolate overflow-hidden bg-[#f6f5f1] px-6 py-24 sm:px-12 md:py-32 lg:px-24"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.9)_0%,_rgba(246,245,241,0)_65%)]" />

      <div className="mx-auto flex max-w-6xl flex-col gap-16 lg:flex-row lg:items-center lg:gap-24">
        <div className="flex-1 space-y-10">
          <span className="animate-fade-up text-xs font-semibold uppercase tracking-[0.55em] text-neutral-500">
            Пространство
          </span>
          <h2 className="animate-fade-up delay-2 text-[clamp(2.6rem,5vw,3.7rem)] font-light tracking-tight text-neutral-900">
            Ателье, где технологии встречают спокойную эстетику
          </h2>
          <p className="animate-fade-up delay-4 text-lg leading-8 text-neutral-500">
            Лобби, приватные переговорные и витрины с образцами позволяют сосредоточиться на выборе решений. Перед выдачей техника проходит финальную полировку прямо в студии.
          </p>
          <div className="animate-fade-up delay-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-[32px] border border-neutral-200/80 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-neutral-400">Concierge</p>
              <p className="mt-3 text-base leading-7 text-neutral-500">
                Персональный специалист сопровождает каждую заявку и предложит альтернативы, если сроки критичны.
              </p>
            </div>
            <div className="rounded-[32px] border border-neutral-200/80 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-neutral-400">Studio care</p>
              <p className="mt-3 text-base leading-7 text-neutral-500">
                Коллекционная упаковка, защищённая доставка и чеклист ухода для каждого устройства.
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-1 justify-end">
          <div className="animate-fade-up delay-4 relative h-[520px] w-full max-w-[440px] overflow-hidden rounded-[56px] border border-neutral-200/60 bg-white shadow-[0_60px_160px_-90px_rgba(15,15,15,0.45)]">
            <Image
              src={gallery[0].src}
              alt={gallery[0].alt}
              fill
              sizes="(min-width: 1280px) 440px, (min-width: 768px) 50vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="animate-fade-up delay-6 absolute -left-24 bottom-[-60px] hidden h-[360px] w-[280px] overflow-hidden rounded-[44px] border border-white/70 bg-white shadow-[0_40px_120px_-80px_rgba(15,15,15,0.45)] md:block">
            <Image
              src={gallery[1].src}
              alt={gallery[1].alt}
              fill
              sizes="280px"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8)_0%,_rgba(255,255,255,0)_70%)]" />
          </div>
        </div>
      </div>
    </Section>
  );
}
