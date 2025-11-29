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

import { FeaturesSection } from "./_components/features-section";
import { ModernHero } from "./_components/modern-hero";
import { ProductsGridSkeleton } from "./_components/products-grid";
import { RepairFocus } from "./_components/repair-focus";

// Dynamic imports для оптимизации
const ProductsGrid = dynamic(
  () => import("./_components/products-grid").then((mod) => ({ default: mod.ProductsGrid })),
  { ssr: true, loading: () => <ProductsGridSkeleton /> }
);

const MembershipBanner = dynamic(
  () => import("./_components/membership-banner").then((mod) => ({ default: mod.MembershipBanner })),
  { ssr: true }
);

const AccountNotifications = dynamic(
  () => import("./_components/account-notifications").then((mod) => ({ default: mod.AccountNotifications })),
  { ssr: true }
);

const ReferralPromoBanner = dynamic(
  () => import("./_components/referral-promo-banner").then((mod) => ({ default: mod.ReferralPromoBanner })),
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
    <>
      {/* Modern Hero Section */}
      <ModernHero user={user} />

      {/* Repair focus */}
      <RepairFocus />

      {/* Features Section */}
      <FeaturesSection />

      {/* Membership Banner */}
      <div className="w-full bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MembershipBanner user={user} />
        </div>
      </div>

      {/* Products Section */}
      <section className="relative w-full overflow-hidden bg-muted/20 py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Популярные товары
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Лучшие предложения для вашей техники
            </p>
          </div>
          <Suspense fallback={<ProductsGridSkeleton />}>
            <ProductsGrid fields={resultPage?.data?.fields} />
          </Suspense>
        </div>
      </section>

      {/* Referral Promo Banner */}
      {user && (
        <div className="w-full bg-background py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Suspense fallback={null}>
              <ReferralPromoBanner user={user} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Account Notifications */}
      <div className="w-full bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AccountNotifications user={user} />
        </div>
      </div>

      <JsonLd jsonLd={websiteToJsonLd()} />
    </>
  );
}
