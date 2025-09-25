"use client";

import Link from "next/link";

interface ShopHeroProps {
  productCount: number;
  categoryCount: number;
  tagCount: number;
  inStockCount: number;
}

export function ShopHero({ productCount, categoryCount, tagCount, inStockCount }: ShopHeroProps) {
  const stats = [
    { label: "Товаров", value: productCount },
    { label: "Категорий", value: categoryCount },
    { label: "Тегов", value: tagCount },
    { label: "На складе", value: inStockCount },
  ];

  return (
    <section className="relative isolate overflow-hidden rounded-[56px] border border-neutral-200/70 bg-white px-10 py-16 shadow-[0_80px_200px_-120px_rgba(15,15,15,0.55)] sm:px-12 lg:px-16">
      <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-white/60 blur-3xl" aria-hidden />
      <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 rounded-full bg-[#f1f0ec] blur-3xl" aria-hidden />

      <div className="relative grid gap-16 lg:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)] lg:items-center">
        <div className="flex flex-col gap-10 text-left">
          <span className="animate-fade-up text-xs font-semibold uppercase tracking-[0.55em] text-neutral-500">
            Каталог BE
          </span>
          <h1 className="animate-fade-up delay-2 text-[clamp(3rem,5.5vw,4.8rem)] font-light tracking-tight text-neutral-900">
            Электроника, которая выглядит как предмет интерьера
          </h1>
          <p className="animate-fade-up delay-4 max-w-2xl text-lg leading-8 text-neutral-500">
            Мы подбираем устройства с премиальным дизайном и продуманной комплектацией. Каждая позиция проходит
            предпродажную подготовку и поддержку сервисной команды.
          </p>
          <div className="animate-fade-up delay-6 flex flex-wrap gap-4">
            <Link
              href="#catalog-section"
              className="inline-flex h-14 items-center justify-center rounded-full border border-neutral-900 bg-neutral-900 px-10 text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-neutral-100 transition-transform duration-500 hover:-translate-y-0.5 hover:shadow-[0_25px_60px_-40px_rgba(15,15,15,0.45)]"
            >
              Каталог
            </Link>
            <Link
              href="/request"
              className="inline-flex h-14 items-center justify-center rounded-full border border-neutral-300/80 bg-white px-10 text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-colors hover:text-neutral-900"
            >
              Консультация
            </Link>
          </div>
        </div>

        <div className="animate-fade-up delay-4 rounded-[48px] border border-neutral-200/70 bg-white px-8 py-10 text-left shadow-[0_60px_160px_-100px_rgba(15,15,15,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-neutral-400">Цифры каталога</p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            {stats.map(({ label, value }, index) => (
              <div key={label} className="flex flex-col gap-2">
                <dt className="text-xs uppercase tracking-[0.35em] text-neutral-400">{label}</dt>
                <dd className="text-[2rem] font-light tracking-tight text-neutral-900">
                  {value.toLocaleString('ru-RU')}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm leading-relaxed text-neutral-500">
            Актуальное наличие и цены обновляются ежедневно. Доставляем по Кыргызстану собственным сервисом или через
            проверенных партнёров.
          </p>
        </div>
      </div>
    </section>
  );
}
