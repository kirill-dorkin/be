"use client";

import { useTranslations } from "next-intl";

import { LogoBase } from "./logo-base";

export const LogoClient = () => {
  const t = useTranslations("common");

  return (
    <LogoBase ariaLabel={t("logo")} title={t("go-to-homepage")} />
  );
};

LogoClient.displayName = "LogoClient";
