"use client";

import { Section } from "@/shared/ui/launchui";

const testimonials = [
  {
    quote:
      "Best Electronics выстроили обслуживание так, что наша команда дизайнеров перестала переживать за технику. Всё происходит тихо, точно и вовремя.",
    author: "Altyn Studio",
    role: "креативная студия",
  },
  {
    quote:
      "Signature Care берёт на себя любые форс-мажоры. Курьеры приезжают в согласованное окно, а отчёты выглядят как художественный каталог.",
    author: "Nord Support",
    role: "служба клиентского сервиса",
  },
  {
    quote:
      "Редкие модели ноутбуков и камер после реставрации выглядят как из витрины. Это единственная команда, которой мы доверяем частную коллекцию.",
    author: "Private Collection",
    role: "частный клиент",
  },
];

export default function Testimonials() {
  return (
    <Section
      id="testimonials"
      className="relative isolate overflow-hidden bg-[#f6f5f1] px-6 py-24 sm:px-12 md:py-32 lg:px-24"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85)_0%,_rgba(246,245,241,0)_70%)]" />

      <div className="mx-auto flex max-w-5xl flex-col gap-16 text-center">
        <header className="space-y-6">
          <span className="animate-fade-up text-xs font-semibold uppercase tracking-[0.55ем] text-neutral-500">
            Отзывы
          </span>
          <h2 className="animate-fade-up delay-2 text-[clamp(2.4rem,4.5vw,3.4rem)] font-light tracking-tight text-neutral-900">
            О нас говорят тихо, но уверенно
          </h2>
          <p className="animate-fade-up delay-4 mx-auto max-w-2xl text-lg leading-8 text-neutral-500">
            Мы делимся только теми историями, где клиенты готовы говорить публично. Остальные остаются за закрытыми дверями, как и положено премиальному сервису.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map(({ quote, author, role }, index) => (
            <figure
              key={author}
              className="animate-fade-up flex h-full flex-col justify-between gap-6 rounded-[40px] border border-neutral-200/80 bg-white px-8 py-10 text-left shadow-[0_40px_130px_-90px_rgba(15,15,15,0.45)]"
              style={{ animationDelay: `${160 * (index + 1)}ms` }}
            >
              <blockquote className="text-sm leading-7 text-neutral-500">
                “{quote}”
              </blockquote>
              <figcaption className="space-y-1 text-neutral-400">
                <div className="text-sm font-semibold uppercase tracking-[0.35em] text-neutral-500">{author}</div>
                <div className="text-xs uppercase tracking-[0.4em]">{role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  );
}
