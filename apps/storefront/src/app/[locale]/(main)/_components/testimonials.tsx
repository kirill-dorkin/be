import { getTranslations } from "next-intl/server";

const testimonialKeys = ["dmitry", "aigul", "rustam"] as const;

export const Testimonials = async () => {
  const t = await getTranslations("home.testimonials");
  const testimonials = testimonialKeys.map((key) => ({
    key,
    name: t(`items.${key}.name`),
    text: t(`items.${key}.text`),
  }));

  return (
    <section className="bg-muted/5 w-full py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-600">
              {t("overline")}
            </p>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              {t("title")}
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.key}
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
