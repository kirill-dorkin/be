import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageType } from "@nimara/domain/objects/CMSPage";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { JsonLd, websiteToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { cmsPageService } from "@/services/cms";
import { getUserService } from "@/services/user";

import { HeroBanner } from "./_components/hero-banner";
import { ProductsGridSkeleton } from "./_components/products-grid";

// Dynamic imports для оптимизации
const ProductsGrid = dynamic(
  () => import("./_components/products-grid").then((mod) => ({ default: mod.ProductsGrid })),
  { ssr: true, loading: () => <ProductsGridSkeleton /> }
);

const RepairDiscountBanner = dynamic(
  () => import("./_components/repair-discount-banner").then((mod) => ({ default: mod.RepairDiscountBanner })),
  { ssr: true }
);

const AccountNotifications = dynamic(
  () => import("./_components/account-notifications").then((mod) => ({ default: mod.AccountNotifications })),
  { ssr: true }
);

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
  searchParams: Promise<Record<string, string>>;
};

export async function generateMetadata(_params: PageProps): Promise<Metadata> {
  const t = await getTranslations("home");

  const url = new URL(clientEnvs.NEXT_PUBLIC_STOREFRONT_URL);
  const canonicalUrl = url.toString();

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      images: [
        {
          url: "/og-hp.png",
          width: 1200,
          height: 630,
          alt: t("homepage-preview"),
        },
      ],
      url: canonicalUrl,
      siteName: "BestElectronics",
    },
  };
}

export default async function Page() {
  // Параллельная загрузка всех данных для максимальной производительности
  const [accessToken, region, userService] = await Promise.all([
    getAccessToken(),
    getCurrentRegion(),
    getUserService(),
  ]);

  const [resultPage, resultUserGet] = await Promise.all([
    cmsPageService.cmsPageGet({
      pageType: PageType.HOMEPAGE,
      slug: "home",
      languageCode: region.language.code,
      options: {
        next: {
          tags: ["CMS:home"],
          revalidate: CACHE_TTL.cms,
        },
      },
    }),
    userService.userGet(accessToken),
  ]);

  const user = resultUserGet.ok ? resultUserGet.data : null;

  return (
    <section className="grid w-full content-start pb-0">
      <HeroBanner fields={resultPage?.data?.fields} />
      <RepairDiscountBanner user={user} />

      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductsGrid fields={resultPage?.data?.fields} />
      </Suspense>
      <div className="pb-0">
        <AccountNotifications user={user} />
      </div>
      {/* <div className="mb-8">
        <Newsletter />
      </div> */}
      <JsonLd jsonLd={websiteToJsonLd()} />
    </section>
  );
}
