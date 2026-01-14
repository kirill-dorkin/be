"use client";

import { useEffect, useRef } from "react";

import { useTranslations } from "next-intl";

export const RepairStats = () => {
  const t = useTranslations("home.repairStats");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stats = [
    {
      label: t("items.monthly.label"),
      value: t("items.monthly.value"),
    },
    {
      label: t("items.technicians.label"),
      value: t("items.technicians.value"),
    },
    {
      label: t("items.turnaround.label"),
      value: t("items.turnaround.value"),
    },
    {
      label: t("items.warranty.label"),
      value: t("items.warranty.value"),
    },
  ];

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

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
    <section className="bg-background w-full py-12 sm:py-16">
      <div
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
        ref={containerRef}
      >
        <div className="border-border/60 bg-card/70 grid gap-4 rounded-2xl border p-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="bg-card/70 rounded-xl px-4 py-3 text-center shadow-sm"
            >
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {item.value}
              </div>
              <div className="text-muted-foreground text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
