import dynamic from "next/dynamic";
import { Suspense } from "react";

import { Header } from "@/components/header";
import { CACHE_TTL } from "@/config";
import { getLocalePrefix } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { getNavigationMenu } from "@/services/navigation-menu";

import { Navigation } from "./_components/navigation";

const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })), {
  ssr: true,
});

async function NavigationWithData() {
  const [region, locale] = await Promise.all([
    getCurrentRegion(),
    getLocalePrefix(),
  ]);

  const resultMenu = await getNavigationMenu({
    channel: region.market.channel,
    languageCode: region.language.code,
    locale,
    options: {
      next: {
        tags: ["CMS:navbar"],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  return <Navigation menu={resultMenu.data?.menu} />;
}

export default async function Layout({ children }: LayoutProps<"/[locale]">) {
  return (
    <>
      <div
        className="bg-background sticky top-0 isolate z-50 pt-safe md:relative md:top-auto"
        style={{ boxShadow: '0 -100vh 0 100vh hsl(var(--background))' } as React.CSSProperties}
      >
        <Header />
        <Suspense fallback={<div className="h-12" />}>
          <NavigationWithData />
        </Suspense>
      </div>
      <main className="flex min-h-screen flex-1 flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}
