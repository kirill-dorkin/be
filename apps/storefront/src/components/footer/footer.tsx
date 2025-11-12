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
    <footer className="bg-muted text-slate-700 dark:text-primary text-sm dark:bg-stone-900 mt-8 md:mt-12">
      <div className="container">
        <div className="flex flex-wrap justify-between gap-8 py-8">
          <div className="grid w-full grid-cols-2 grid-rows-[max-content,max-content] place-items-start justify-start gap-6 md:grid-cols-3">
            <div className="col-span-2 row-span-2 grid grid-cols-subgrid grid-rows-subgrid md:col-span-1">
              <div className="col-span-2 flex justify-center md:col-span-1 md:justify-start">
                <LocalizedLink
                  href={paths.home.asPath()}
                  title={t("common.go-to-homepage")}
                  className="inline-flex items-center text-xl font-semibold text-slate-700 transition-colors hover:text-slate-500 dark:text-white dark:hover:text-white/80 sm:text-2xl"
                >
                  <span aria-hidden="true" className="leading-none tracking-tight">
                    BestElectronics
                  </span>
                </LocalizedLink>
              </div>
              <p className="col-span-2 flex justify-center md:col-span-1 md:justify-start">
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
            </div>

            <div className="row-span-2 grid grid-cols-subgrid grid-rows-subgrid md:col-span-1">
              <span className="text-slate-700 dark:text-primary flex items-center">
                {t("footer.our-products")}
              </span>
              <div className="flex flex-col gap-4">
                {productMenuItems.map((item) => (
                  <span key={item.id} className="inline">
                    <LocalizedLink
                      href={item.url}
                      className="hover:underline"
                      prefetch={false}
                    >
                      {item.label}
                    </LocalizedLink>
                  </span>
                ))}
              </div>
            </div>

            <div className="row-span-2 grid grid-cols-subgrid grid-rows-subgrid md:col-span-1">
              <span className="text-slate-700 dark:text-primary flex items-center">
                {t("footer.help")}
              </span>
              <div className="flex flex-col gap-4">
                {helpLinks.map((item) => (
                  <span key={item.id} className="inline">
                    <LocalizedLink
                      href={item.url}
                      className="inline hover:underline"
                      prefetch={false}
                    >
                      {item.label}
                    </LocalizedLink>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="border-muted-foreground/50 text-muted-foreground flex flex-wrap justify-between gap-4 border-t py-8">
          <span className="flex-grow basis-full text-center sm:basis-1 sm:text-left">
            &#xa9; BestElectronics {new Date().getFullYear()}
          </span>
          <span className="flex-grow basis-full text-center sm:basis-1">
            {t.rich("footer.made-with", {
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
          </span>
          <span className="flex-grow basis-full text-center sm:basis-1 sm:text-right">
            {t.rich("footer.open-source", {
              link: (chunks) => (
                <LocalizedLink
                  href="https://www.bestelectronics.com/platform"
                  className="hover:underline"
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
