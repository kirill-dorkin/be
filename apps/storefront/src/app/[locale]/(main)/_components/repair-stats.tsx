"use client";

import { useEffect, useRef } from "react";

const stats = [
  { label: "Ремонтов в месяц", value: "500+" },
  { label: "Мастеров в штате", value: "30" },
  { label: "Средний срок ремонта", value: "1.5 дня" },
  { label: "Гарантия на работы", value: "до 6 мес." },
];

export const RepairStats = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            node.classList.add("animate-fade-in-up");
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" ref={containerRef}>
        <div className="grid gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-card/70 px-4 py-3 text-center shadow-sm"
            >
              <div className="text-2xl font-bold text-foreground sm:text-3xl">{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
