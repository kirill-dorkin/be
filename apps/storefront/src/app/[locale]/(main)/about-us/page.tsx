import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageType } from "@nimara/domain/objects/CMSPage";

import { StaticPage } from "@/components/static-page";
import { CACHE_TTL } from "@/config";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { cmsPageService } from "@/services/cms";

const SLUG = "about-us";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export async function generateMetadata(_props: PageProps): Promise<Metadata> {
  const region = await getCurrentRegion();

  const resultPage = await cmsPageService.cmsPageGet({
    languageCode: region.language.code,
    slug: SLUG,
    options: {
      next: {
        tags: [`CMS:${SLUG}`],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  return {
    title: resultPage?.data?.title,
  };
}

export default async function AboutUsPage() {
  const region = await getCurrentRegion();

  const resultPage = await cmsPageService.cmsPageGet({
    pageType: PageType.STATIC_PAGE,
    slug: SLUG,
    languageCode: region.language.code,
    options: {
      next: {
        tags: [`CMS:${SLUG}`],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  if (!resultPage.ok) {
    notFound();
  }

  return <StaticPage body={resultPage.data?.content} />;
}
