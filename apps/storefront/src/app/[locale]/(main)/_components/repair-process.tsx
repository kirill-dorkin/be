import { ClipboardList, ShieldCheck, Truck, Wrench } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Заявка и диагностика",
    desc: "Принимаем заявку онлайн или по телефону, проводим первичную оценку.",
  },
  {
    icon: Wrench,
    title: "Ремонт и запчасти",
    desc: "Оригинальные комплектующие, мастера с опытом. Согласуем стоимость заранее.",
  },
  {
    icon: ShieldCheck,
    title: "Тестирование и гарантия",
    desc: "Проверяем устройство после ремонта, предоставляем гарантию на работы.",
  },
  {
    icon: Truck,
    title: "Выдача или доставка",
    desc: "Самовывоз или курьером — как удобно. Информируем на каждом этапе.",
  },
];

export const RepairProcess = () => {
  return (
    <section className="w-full bg-muted/8 py-14 sm:py-18">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-600">
              Как мы работаем
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Прозрачный процесс ремонта
            </h2>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">
              От заявки до выдачи: вы знаете, на каком этапе находится устройство, и сколько это стоит.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className="group rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
