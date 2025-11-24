"use client";

import { LayoutGrid, List,type LucideIcon  } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";

export type ViewMode = "grid" | "compact" | "list";

type ViewToggleProps = {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
};

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  const t = useTranslations("view-toggle");
  const [isAnimating, setIsAnimating] = useState(false);

  const views: Array<{ icon: LucideIcon; label: string; mode: ViewMode }> = [
    // { icon: SquareStack, label: t("grid"), mode: "grid" },
    { icon: LayoutGrid, label: t("compact"), mode: "compact" },
    { icon: List, label: t("list"), mode: "list" },
  ];

  const currentIndex = views.findIndex((v) => v.mode === currentView);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);

    return () => clearTimeout(timer);
  }, [currentView]);

  return (
    <div className="relative flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-1 shadow-sm dark:border-white/10 dark:bg-muted/20">
      <div
        className="absolute left-1 h-8 w-8 rounded-md bg-primary shadow-md"
        style={{
          transform: `translateX(${currentIndex * 36}px) scaleX(${isAnimating ? 1.075 : 1}) scaleY(${isAnimating ? 0.9 : 1})`,
          transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
      {views.map(({ icon: Icon, label, mode }) => (
        <Button
          key={mode}
          variant="ghost"
          size="icon"
          onClick={() => onViewChange(mode)}
          className="relative z-10 h-8 w-8 transition-all duration-300 ease-in-out hover:bg-transparent"
          aria-label={label}
          title={label}
        >
          <Icon
            className={`h-4 w-4 transition-all duration-300 ease-in-out ${
              currentView === mode
                ? "scale-110 text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          />
        </Button>
      ))}
    </div>
  );
};
