import { getTranslations } from "next-intl/server";

import { LogoBase } from "./logo-base";

export const Logo = async () => {
  const t = await getTranslations("common");

  return <LogoBase ariaLabel={t("logo")} title={t("go-to-homepage")} />;
};

Logo.displayName = "Logo";
