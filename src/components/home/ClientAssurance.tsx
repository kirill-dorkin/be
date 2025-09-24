"use client";

import { Section } from "@/shared/ui/launchui";

const assurances = [
  {
    metric: "72 часа",
    description: "На полный цикл диагностики и подготовку отчёта.",
  },
  {
    metric: "5 лет",
    description: "Храним историю обслуживания и рекомендации по уходу.",
  },
  {
    metric: "24/7",
    description: "Консьерж-команда на связи в мессенджерах и по телефону.",
  },
];

const services = [
  "Удалённая диагностика и настройка",
  "Инсталляция фирменных аксессуаров",
  "Транспортировка в защитных капсулах",
  "Регулярные апгрейд-сессии",
];

export default function ClientAssurance() {
  return (
    <Section
      id="assurance"
      className="relative isolate overflow-hidden bg-white px-6 py-24 sm:px-12 md:py-32 lg:px-24"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_rgba(248,247,244,0.75)_0%,_rgba(255,255,255,0)_70%)]" />

      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        <header className="space-y-6 text-center">
          <span className="animate-fade-up text-xs font-semibold uppercase tracking-[0.55em] text-neutral-500">
            Гарантии
          </span>
          <h2 className="animate-fade-up delay-2 text-[clamp(2.4rem,4.5vw,3.4rem)] font-light tracking-tight text-neutral-900">
            Спокойствие на каждом этапе сервиса
          </h2>
          <p className="animate-fade-up delay-4 mx-auto max-w-2xl text-lg leading-8 text-neutral-500">
            Мы объединяем инженерные стандарты и внимательную коммуникацию. Все сроки, отчёты и решения зафиксированы заранее, а статус устройства всегда доступен онлайн.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {assurances.map(({ metric, description }, index) => (
            <div
              key={metric}
              className="animate-fade-up rounded-[40px] border border-neutral-200/70 bg-white px-10 py-12 shadow-[0_40px_120px_-90px_rgba(15,15,15,0.4)]"
              style={{ animationDelay: `${140 * (index + 1)}ms` }}
            >
              <span className="text-[clamp(2.5rem,4vw,3rem)] font-light tracking-tight text-neutral-900">{metric}</span>
              <p className="mt-4 text-sm leading-7 text-neutral-500">{description}</p>
            </div>
          ))}
        </div>

        <div className="animate-fade-up delay-6 rounded-[44px] border border-neutral-200/80 bg-white px-10 py-12 text-left shadow-[0_35px_110px_-90px_rgba(15,15,15,0.35)]">
          <h3 className="text-xl font-semibold text-neutral-900">Что включено в сопровождение</h3>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {services.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-neutral-500">
                <span className="inline-block h-1 w-6 bg-neutral-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
