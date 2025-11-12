"use client";

import { useTranslations } from "next-intl";
import { memo } from "react";

import { LogoBase } from "./logo-base";

const LogoClientComponent = () => {
  const t = useTranslations("common");

  return (
    <LogoBase ariaLabel={t("logo")} title={t("go-to-homepage")} />
  );
};

// Мемоизация - статичный логотип
export const LogoClient = memo(LogoClientComponent);
LogoClient.displayName = "LogoClient";
