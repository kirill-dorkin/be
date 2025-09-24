"use client";

import { Clock, Gauge, Sparkles } from "lucide-react";

import { Section } from "@/shared/ui/launchui";

const focusAreas = [
  "Инженерная диагностика",
  "Реставрация премиальных устройств",
  "Комплектация студий и офисов",
  "Постгарантийное сопровождение",
];

const featureCards = [
  {
    icon: Clock,
    label: "60 минут",
    title: "На первичную оценку",
    description:
      "Подтверждаем состояние техники и формируем прозрачную смету без скрытых пунктов.",
  },
  {
    icon: Gauge,
    label: "12 этапов",
    title: "Калибровки и контроля",
    description:
      "Каждый ремонт проходит сертифицированные проверки на соответствие заводским параметрам.",
  },
  {
    icon: Sparkles,
    label: "Сценарии",
    title: "Под задачи клиента",
    description:
      "Создаём персональные рекомендации по апгрейду и уходу, чтобы техника выглядела безупречно.",
  },
];

export default function Highlights() {
  return (
    <Section
      id="capabilities"
      className="relative isolate overflow-hidden bg-white px-6 py-24 sm:px-12 md:py-32 lg:px-24"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(248,247,244,0.8)_0%,_rgba(255,255,255,0)_65%)]" />

      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-6">
            <span className="animate-fade-up text-xs font-semibold uppercase tracking-[0.55em] text-neutral-500">
              Сервис премиум-класса
            </span>
            <h2 className="animate-fade-up delay-2 text-[clamp(2.8rem,5vw,3.9rem)] font-light tracking-tight text-neutral-900">
              Прозрачные процессы и безупречная подача техники
            </h2>
            <p className="animate-fade-up delay-4 text-lg leading-8 text-neutral-500">
              Мы фиксируем каждый этап обслуживания и подбираем сценарии работы с устройствами так, чтобы сохранялась их эстетика и ценность.
            </p>
          </div>

          <ul className="animate-fade-up delay-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
            {focusAreas.map((item) => (
              <li
                key={item}
                className="rounded-full border border-neutral-300/80 bg-white px-5 py-2 transition-colors hover:text-neutral-900"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {featureCards.map(({ icon: Icon, label, title, description }, index) => (
            <article
              key={title}
              className="animate-fade-up rounded-[44px] border border-neutral-200/80 bg-white px-10 py-12 shadow-[0_40px_120px_-80px_rgba(15,15,15,0.4)] transition-transform duration-500 ease-out hover:-translate-y-2"
              style={{ animationDelay: `${120 * (index + 1)}ms` }}
            >
              <div className="flex items-center gap-4 text-neutral-500">
                <Icon className="h-5 w-5" />
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.45em]">{label}</span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-900">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-neutral-500">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
