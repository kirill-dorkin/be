"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Section } from "@/shared/ui/launchui";

const memberships = [
  {
    name: "Signature",
    summary: "Для коллекций до 10 устройств",
    benefits: [
      "Приоритетная диагностика",
      "Персональный курьер",
      "Полный отчёт после каждой работы",
    ],
    note: "от 24 000 ₸ / месяц",
  },
  {
    name: "Heritage",
    summary: "Для студий и брендов",
    benefits: [
      "Индивидуальные SLA",
      "Запас комплектующих на складе",
      "On-site инженеры по запросу",
    ],
    note: "условия обсуждаются персонально",
  },
];

export default function SignatureCare() {
  return (
    <Section
      id="signature-care"
      className="relative isolate overflow-hidden bg-white px-6 py-24 sm:px-12 md:py-32 lg:px-24"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(248,247,244,0.75)_0%,_rgba(255,255,255,0)_70%)]" />

      <div className="mx-auto flex max-w-6xl flex-col gap-16 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl space-y-8">
          <span className="animate-fade-up text-xs font-semibold uppercase tracking-[0.55em] text-neutral-500">
            Подписка
          </span>
          <h2 className="animate-fade-up delay-2 text-[clamp(2.5rem,5vw,3.6rem)] font-light tracking-tight text-neutral-900">
            Signature Care — команда инженеров в вашем распоряжении
          </h2>
          <p className="animate-fade-up delay-4 text-lg leading-8 text-neutral-500">
            Мы формируем индивидуальные регламенты обслуживания, синхронизируем график с вашим календарём и отслеживаем состояние техники, чтобы вы занимались задачами, а не ремонтом.
          </p>
          <Button
            asChild
            size="lg"
            className="animate-fade-up delay-6 h-14 rounded-full px-10 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-100 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_25px_60px_-40px_rgba(16,16,16,0.45)]"
          >
            <Link href="/request">Запросить презентацию</Link>
          </Button>
        </div>

        <div className="grid w-full max-w-xl gap-8">
          {memberships.map((plan, index) => (
            <article
              key={plan.name}
              className="animate-fade-up rounded-[44px] border border-neutral-200/70 bg-white px-10 py-12 shadow-[0_45px_140px_-95px_rgba(15,15,15,0.45)] transition-transform duration-500 ease-out hover:-translate-y-2"
              style={{ animationDelay: `${180 * (index + 1)}ms` }}
            >
              <div className="flex items-baseline justify-between text-neutral-500">
                <h3 className="text-2xl font-semibold tracking-[0.2em] text-neutral-900 uppercase">
                  {plan.name}
                </h3>
                <span className="text-[0.7rem] uppercase tracking-[0.45em]">membership</span>
              </div>
              <p className="mt-4 text-sm uppercase tracking-[0.35em] text-neutral-400">
                {plan.summary}
              </p>
              <ul className="mt-8 flex flex-col gap-3 text-sm leading-7 text-neutral-500">
                {plan.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <span className="inline-block h-1 w-6 bg-neutral-300" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <p className="mt-10 text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
                {plan.note}
              </p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
