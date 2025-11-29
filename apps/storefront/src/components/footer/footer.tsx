import { getTranslations } from "next-intl/server";

import { CACHE_TTL } from "@/config";
import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { cmsMenuService } from "@/services/cms";
import { getNavigationMenu } from "@/services/navigation-menu";

export const Footer = async () => {
  const [region, t, helpNavT] = await Promise.all([
    getCurrentRegion(),
    getTranslations(),
    getTranslations("help.nav"),
  ]);

  const resultMenu = await cmsMenuService.menuGet({
    channel: region.market.channel,
    languageCode: region.language.code,
    slug: "footer",
    options: {
      next: {
        tags: ["CMS:footer"],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  const resultCategories = await getNavigationMenu({
    channel: region.market.channel,
    languageCode: region.language.code,
    options: {
      next: {
        tags: ["CMS:navbar"],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  const helpMenuItems = resultMenu.data?.menu?.items ?? [];
  const helpLinks =
    helpMenuItems.length > 0
      ? helpMenuItems
      : [
          {
            id: "help-overview",
            label: helpNavT("overview"),
            url: paths.help.asPath(),
          },
          {
            id: "help-orders",
            label: helpNavT("orders"),
            url: paths.help.orders.asPath(),
          },
          {
            id: "help-delivery",
            label: helpNavT("delivery"),
            url: paths.help.delivery.asPath(),
          },
          {
            id: "help-repairs",
            label: helpNavT("repairs"),
            url: paths.help.repairs.asPath(),
          },
          {
            id: "help-faq",
            label: helpNavT("faq"),
            url: paths.help.faq.asPath(),
          },
        ];

  const productMenuItems = resultCategories.data?.menu?.items ?? [];

  return (
    <footer className="mt-10 bg-gradient-to-b from-background to-muted/50 text-sm text-slate-700 dark:text-slate-200">
      <div className="container">
        <div className="grid gap-8 border-t border-border/60 py-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-4">
            <LocalizedLink
              href={paths.home.asPath()}
              title={t("common.go-to-homepage")}
              className="inline-flex items-center text-xl font-semibold tracking-tight text-slate-800 transition-colors hover:text-primary dark:text-white dark:hover:text-primary"
            >
              BestElectronics
            </LocalizedLink>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              {t.rich("footer.demo-version", {
                link: (chunks) => (
                  <LocalizedLink
                    href="https://www.bestelectronics.com"
                    className="hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={false}
                  >
                    {chunks}
                  </LocalizedLink>
                ),
              })}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <LocalizedLink
                href={paths.privacyPolicy.asPath()}
                className="hover:text-primary"
              >
                {t("common.privacy-policy")}
              </LocalizedLink>
              <span aria-hidden="true">•</span>
              <LocalizedLink
                href={paths.termsOfUse.asPath()}
                className="hover:text-primary"
              >
                {t("common.terms-of-use")}
              </LocalizedLink>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-foreground text-sm font-semibold uppercase tracking-[0.15em]">
              {t("footer.our-products")}
            </p>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {productMenuItems.map((item) => (
                <LocalizedLink
                  key={item.id}
                  href={item.url}
                  className="text-muted-foreground hover:text-primary"
                  prefetch={false}
                >
                  {item.label}
                </LocalizedLink>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-foreground text-sm font-semibold uppercase tracking-[0.15em]">
              {t("footer.help")}
            </p>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {helpLinks.map((item) => (
                <LocalizedLink
                  key={item.id}
                  href={item.url}
                  className="text-muted-foreground hover:text-primary"
                  prefetch={false}
                >
                  {item.label}
                </LocalizedLink>
              ))}
            </div>
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground flex flex-col gap-3 border-t py-6 text-center text-xs sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <span>&#xa9; BestElectronics {new Date().getFullYear()}</span>
          <span className="text-center sm:text-right">
            {t.rich("footer.open-source", {
              link: (chunks) => (
                <LocalizedLink
                  href="#"
                  className="hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  prefetch={false}
                >
                  {chunks}
                </LocalizedLink>
              ),
            })}
          </span>
        </div>
      </div>
    </footer>
  );
};
