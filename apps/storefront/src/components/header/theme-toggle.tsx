"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@nimara/ui/components/button";

const ThemeToggleComponent = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const t = useTranslations("common");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Мемоизация флага темной темы
  const isDark = useMemo(() => resolvedTheme === "dark", [resolvedTheme]);

  // Мемоизация обработчика переключения темы
  const handleToggle = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label={
        mounted
          ? t(isDark ? "switch-to-light" : "switch-to-dark")
          : t("toggle-theme")
      }
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
};

// Мемоизация - переключатель темы
export const ThemeToggle = memo(ThemeToggleComponent);
