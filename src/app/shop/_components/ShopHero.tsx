import Link from "next/link";
import { ShoppingBag, Sparkles, ShieldCheck, Truck } from "lucide-react";

interface ShopHeroProps {
  productCount: number;
  categoryCount: number;
  tagCount: number;
  inStockCount: number;
}

const heroStats = [
  { label: "Товаров", icon: ShoppingBag },
  { label: "Категорий", icon: ShieldCheck },
  { label: "Тегов", icon: Sparkles },
  { label: "На складе", icon: Truck },
] as const;

export function ShopHero({ productCount, categoryCount, tagCount, inStockCount }: ShopHeroProps) {
  const values = [productCount, categoryCount, tagCount, inStockCount];

  return (
    <section className="relative overflow-hidden rounded-4xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
      <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
      <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
      <div className="relative grid gap-12 px-8 py-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:px-14 xl:px-20">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-white/80">
            <Sparkles className="h-4 w-4" /> Магазин техники be.kg
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Каталог оборудования для бизнеса, творчества и дома
          </h1>
          <p className="text-base text-white/70 sm:text-lg">
            Подберите готовые решения, настроенные под высокие нагрузки и ежедневные задачи. Мы обновляем ассортимент,
            проверяем наличие и следим за качеством сервисного обслуживания.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#catalog"
              className="inline-flex items-center justify-center rounded-3xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Перейти к каталогу
            </Link>
            <Link
              href="/shop?sort=newest"
              className="inline-flex items-center justify-center rounded-3xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Новинки недели
            </Link>
          </div>
        </div>
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
          <h2 className="text-lg font-semibold text-white">Цифры магазина</h2>
          <div className="grid grid-cols-2 gap-3">
            {heroStats.map(({ label, icon: Icon }, index) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-white/70">
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
                <div className="text-2xl font-semibold">
                  {values[index].toLocaleString("ru-RU")}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/60">
            Все товары проходят модерацию: проверяем характеристики и актуальность цен. Доставка осуществляется нашими
            партнёрами по Кыргызстану.
          </p>
        </div>
      </div>
    </section>
  );
}
