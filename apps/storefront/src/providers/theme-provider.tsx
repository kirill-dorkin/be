"use client";

import { ThemeProvider } from "next-themes";
import { memo, useEffect, useState } from "react";

const ClientThemeProviderComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setPrefersReducedMotion(mediaQuery.matches);

    // Мемоизация обработчика изменения
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
      disableTransitionOnChange={prefersReducedMotion}
    >
      {children}
    </ThemeProvider>
  );
};

// Мемоизация - Provider темы (только children меняется)
export const ClientThemeProvider = memo(ClientThemeProviderComponent);
