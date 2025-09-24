"use client";

import { ClipboardList, Package, ShieldCheck, Sparkles } from "lucide-react";

import { Section } from "@/shared/ui/launchui";

const steps = [
  {
    icon: ClipboardList,
    title: "Заявка",
    description:
      "Вы описываете задачу и предпочитаемый способ коммуникации. Менеджер формирует профиль устройства и подбирает инженера.",
  },
  {
    icon: Sparkles,
    title: "Диагностика",
    description:
      "Проводим комплексную оценку, фиксируем фото и передаём смету с точными сроками. Ни один этап не запускается без вашего подтверждения.",
  },
  {
    icon: ShieldCheck,
    title: "Ремонт",
    description:
      "Используем оригинальные компоненты, ведём чекап по чеклисту и сохраняем историю работ в личном кабинете.",
  },
  {
    icon: Package,
    title: "Выдача",
    description:
      "Техника проходит финальную полировку и упаковку. Доставка возможна курьером с температурным контролем либо в нашем ателье.",
  },
];

export default function ServiceWorkflow() {
  return (
    <Section
      id="workflow"
      className="relative isolate overflow-hidden bg-white px-6 py-24 sm:px-12 md:py-32 lg:px-24"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(248,247,244,0.75)_0%,_rgba(255,255,255,0)_70%)]" />

      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        <header className="space-y-6 text-left">
          <span className="animate-fade-up text-xs font-semibold uppercase tracking-[0.55em] text-neutral-500">
            Процесс
          </span>
          <h2 className="animate-fade-up delay-2 text-[clamp(2.4rem,4.8vw,3.6rem)] font-light tracking-tight text-neutral-900">
            Тишина, предсказуемость и контроль на каждом шаге
          </h2>
          <p className="animate-fade-up delay-4 text-lg leading-8 text-neutral-500">
            Все статусы доступны онлайн, а персональный менеджер подскажет, когда устройство будет готово к выдаче или доставке.
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-2">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className="animate-fade-up flex h-full flex-col gap-6 rounded-[40px] border border-neutral-200/70 bg-white/80 px-10 py-12 shadow-[0_30px_110px_-90px_rgba(15,15,15,0.45)]"
              style={{ animationDelay: `${160 * (index + 1)}ms` }}
            >
              <div className="flex items-center gap-4 text-neutral-500">
                <Icon className="h-5 w-5" />
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-neutral-400">
                  Шаг {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h3>
              <p className="text-sm leading-7 text-neutral-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
