"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Section } from "@/shared/ui/launchui";

const contacts = [
  { label: "+996 501‑31‑31‑14", href: "tel:+996501313114" },
  { label: "+996 557‑31‑31‑14", href: "tel:+996557313114" },
  { label: "WhatsApp", href: "https://wa.me/996501313114" },
  { label: "Сервис: Кулатова 8/1", href: "https://maps.apple.com/?q=Кулатова+8/1" },
];

export default function SupportBanner() {
  return (
    <Section
      id="support"
      className="relative isolate overflow-hidden bg-[#f6f5f1] px-6 py-24 sm:px-12 md:py-28 lg:px-24"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.88)_0%,_rgba(246,245,241,0)_70%)]" />

      <div className="mx-auto flex max-w-5xl flex-col gap-16 rounded-[52px] border border-white/70 bg-white/70 px-10 py-16 text-left shadow-[0_60px_150px_-100px_rgba(15,15,15,0.5)] backdrop-blur-sm lg:flex-row lg:items-center lg:gap-24 lg:px-16 lg:py-20">
        <div className="flex-1 space-y-6">
          <span className="animate-fade-up text-xs font-semibold uppercase tracking-[0.55em] text-neutral-500">
            Персональная поддержка
          </span>
          <h2 className="animate-fade-up delay-2 text-[clamp(2.4rem,4.5vw,3.4rem)] font-light tracking-tight text-neutral-900">
            Расскажите о задаче — мы предложим решение без спешки
          </h2>
          <p className="animate-fade-up delay-4 text-lg leading-8 text-neutral-500">
            Консьерж-команда ответит ежедневно с 09:00 до 19:00 и поможет выбрать удобный способ передачи устройства.
          </p>
          <ul className="animate-fade-up delay-6 grid gap-3 text-sm text-neutral-500 sm:grid-cols-2">
            {contacts.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  prefetch={false}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex items-center gap-3 transition-colors hover:text-neutral-900"
                >
                  <span className="inline-block h-1 w-6 bg-neutral-300" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex w-full flex-col gap-4 sm:w-auto">
          <Button
            asChild
            size="lg"
            className="animate-fade-up delay-6 h-14 rounded-full px-10 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-100 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_25px_60px_-40px_rgба(16,16,16,0.45)]"
          >
            <Link href="/request">Оформить сервис</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="animate-fade-up delay-8 h-14 rounded-full border border-neutral-300/80 bg-white px-10 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <Link href="/shop">Выбрать технику</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
