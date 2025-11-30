const testimonials = [
  {
    name: "Дмитрий П.",
    text: "Сломался ноутбук — сделали диагностику в тот же день, заменили клавиатуру и почистили. Приятно, что звонят и согласовывают цену.",
  },
  {
    name: "Айгуль С.",
    text: "Поменяли экран на телефоне и подобрали стекло. Выезд мастера был удобным, всё заняло меньше часа.",
  },
  {
    name: "Рустам Т.",
    text: "Пользуюсь сервисом для обслуживания офисной техники. Всегда быстро реагируют, есть скидки и гарантия на работы.",
  },
];

export const Testimonials = () => {
  return (
    <section className="bg-muted/5 w-full py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-600">
              Отзывы
            </p>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Клиенты о нашем сервисе
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="border-border/60 bg-card/70 rounded-2xl border p-4 shadow-sm"
            >
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.text}
              </p>
              <p className="text-foreground mt-3 text-sm font-semibold">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
