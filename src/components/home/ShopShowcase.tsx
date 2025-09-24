"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Product } from "@/shared/types";
import { Section } from "@/shared/ui/launchui";
import shopService from "@/services/shopService";

const FALLBACK_IMAGE = "/images/placeholders/product-placeholder.svg";

export default function ShopShowcase() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const products = await shopService.listProducts();
        if (!mounted) return;
        setItems(products.slice(0, 3));
      } catch {
        if (mounted) setItems([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Section
      id="showcase"
      className="relative isolate overflow-hidden bg-white px-6 py-24 sm:px-12 md:py-32 lg:px-24"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,_rgba(248,247,244,0.75)_0%,_rgba(255,255,255,0)_65%)]" />

      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-6">
            <span className="animate-fade-up text-xs font-semibold uppercase tracking-[0.55em] text-neutral-500">
              Кураторский выбор
            </span>
            <h2 className="animate-fade-up delay-2 text-[clamp(2.6rem,5vw,3.6rem)] font-light tracking-tight text-neutral-900">
              Устройства, которые выглядят как предметы искусства
            </h2>
            <p className="animate-fade-up delay-4 text-lg leading-8 text-neutral-500">
              Каждый продукт перед съёмкой проходит предпродажную подготовку и проверку. Мы отбираем модели, которые органично впишутся в интерьер студии или домашнего кабинета.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="animate-fade-up delay-6 h-14 rounded-full px-10 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-100 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_25px_60px_-40px_rgba(16,16,16,0.45)]"
          >
            <Link href="/shop">Смотреть каталог</Link>
          </Button>
        </header>

        <div className="grid gap-10 lg:grid-cols-3">
          {items.length === 0 && (
            <div className="animate-fade-up rounded-[48px] border border-dashed border-neutral-300/60 bg-neutral-50/80 px-10 py-16 text-center text-sm uppercase tracking-[0.35em] text-neutral-400">
              Коллекция обновляется. Оставьте заявку, и куратор подготовит подборку под ваш стиль.
            </div>
          )}

          {items.map((item, index) => {
            const cover = item.images?.[0] ?? FALLBACK_IMAGE;
            return (
              <Link
                key={item._id ?? item.slug}
                href={`/shop/${item.slug}`}
                className="animate-fade-up group relative flex h-full flex-col overflow-hidden rounded-[48px] border border-neutral-200/70 bg-white shadow-[0_50px_150px_-90px_rgba(15,15,15,0.45)] transition-transform duration-500 ease-out hover:-translate-y-2"
                style={{ animationDelay: `${140 * (index + 1)}ms` }}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-50">
                  <Image
                    src={cover}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 90vw"
                    className="object-cover transition-transform duration-[3500ms] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65)_0%,_rgba(255,255,255,0)_70%)]" />
                </div>
                <div className="flex flex-1 flex-col gap-3 px-10 pb-12 pt-8">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.55em] text-neutral-400">
                    curated selection
+                  </span>
                  <h3 className="text-2xl font-semibold tracking-tight text-neutral-900">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm leading-7 text-neutral-500 line-clamp-3">{item.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-2xl font-semibold text-neutral-900">
                      {new Intl.NumberFormat("ru-RU", {
                        style: "currency",
                        currency: item.currency ?? "RUB",
                        maximumFractionDigits: 0,
                      }).format(item.price)}
                    </span>
                    <span className="rounded-full border border-neutral-200/70 bg-neutral-100 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-neutral-500">
                      {item.stock > 0 ? `В наличии` : "Под заказ"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
