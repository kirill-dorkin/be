"use client";

import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { cn } from "@nimara/ui/lib/utils";

export function ScrollToEstimatorButton() {
  const t = useTranslations("services");
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const estimatorSection = document.getElementById("service-request");

      if (!estimatorSection) {
        // Если секция не найдена, показываем кнопку после небольшой прокрутки
        const shouldShow = window.scrollY > 200;

        if (shouldShow && !hasAnimated) {
          setHasAnimated(true);
        }
        setIsVisible(shouldShow);
        
return;
      }

      const rect = estimatorSection.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;

      // Показываем кнопку когда прокрутили вниз и секция оценки не полностью видна
      const shouldShow = window.scrollY > 200 && !isInView;

      if (shouldShow && !hasAnimated) {
        setHasAnimated(true);
      }
      setIsVisible(shouldShow);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Проверяем сразу

    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasAnimated]);

  const scrollToEstimator = () => {
    const estimatorSection = document.getElementById("service-request");

    if (estimatorSection) {
      const headerHeight = 80; // Высота header (можно получить динамически)
      const elementPosition = estimatorSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (!hasAnimated && !isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-16 scale-90 opacity-0 pointer-events-none"
      )}
      style={{
        transitionProperty: "transform, opacity, scale",
      }}
    >
      <Button
        onClick={scrollToEstimator}
        size="lg"
        className={cn(
          "group relative overflow-hidden h-14 w-14 rounded-full p-0 transition-all duration-300 ease-out sm:h-auto sm:w-auto sm:rounded-xl sm:px-6 sm:py-3",
          "bg-gradient-to-br from-primary via-primary to-primary/80",
          "shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)]",
          "hover:scale-110 active:scale-95",
          "border border-primary/20"
        )}
        aria-label={t("hero.primaryCta")}
      >
        {/* Анимированный градиентный фон при hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-white/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Пульсирующее кольцо */}
        <div className="absolute inset-0 rounded-full sm:rounded-xl animate-ping opacity-20 bg-primary" />

        {/* Контент кнопки */}
        <div className="relative flex items-center justify-center gap-2">
          <Calculator className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
          <span className="hidden sm:inline font-semibold">{t("hero.primaryCta")}</span>
        </div>
      </Button>
    </div>
  );
}
