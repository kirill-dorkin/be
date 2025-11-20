import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { paths } from "@/lib/paths";

import { HelpNavigation } from "./_components/help-navigation";

type HelpLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function HelpLayout({
  children,
  params,
}: HelpLayoutProps) {
  const { locale } = await params;
  const [navT, headingT] = await Promise.all([
    getTranslations({ locale, namespace: "help.nav" }),
    getTranslations({ locale, namespace: "help.sidebar" }),
  ]);

  const links = [
    {
      href: paths.help.asPath(),
      label: navT("overview"),
      description: navT("overviewDescription"),
    },
    {
      href: paths.help.orders.asPath(),
      label: navT("orders"),
      description: navT("ordersDescription"),
    },
    {
      href: paths.help.delivery.asPath(),
      label: navT("delivery"),
      description: navT("deliveryDescription"),
    },
    {
      href: paths.help.repairs.asPath(),
      label: navT("repairs"),
      description: navT("repairsDescription"),
    },
    {
      href: paths.help.faq.asPath(),
      label: navT("faq"),
      description: navT("faqDescription"),
    },
  ];

  return (
    <div className="bg-background">
      <div className="container py-6 pb-20 sm:py-10 sm:pb-24 lg:py-14 lg:pb-16 xl:py-16">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <HelpNavigation
            heading={{
              overline: headingT("overline"),
              title: headingT("title"),
              subtitle: headingT("subtitle"),
            }}
            links={links}
          />
          <div className="space-y-8 sm:space-y-10 lg:space-y-12">{children}</div>
        </div>
      </div>
    </div>
  );
}
