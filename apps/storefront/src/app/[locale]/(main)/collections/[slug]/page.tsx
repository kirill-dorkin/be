import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { RichText } from "@nimara/ui/components/rich-text/rich-text";
import { editorJSDataToString } from "@nimara/ui/lib/richText";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CACHE_TTL, DEFAULT_RESULTS_PER_PAGE, IMAGE_QUALITY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { getCollectionService } from "@/services/collection";

import { SearchPagination } from "../../_components/search-pagination";
import { ProductsListWithMode } from "../../search/_components/products-list-with-mode";
import {
  ViewModeProvider,
  ViewToggleControl,
} from "../../search/_components/search-header";

type PageProps = {
  params: Promise<{
    locale: SupportedLocale;
    slug: string;
  }>;
  searchParams: Promise<{
    after?: string;
    before?: string;
    limit?: string;
  }>;
};

export async function generateMetadata(props: PageProps) {
  const [{ slug }, region, collectionService] = await Promise.all([
    props.params,
    getCurrentRegion(),
    getCollectionService(),
  ]);

  const url = new URL(
    paths.collections.asPath({ slug }),
    clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
  );
  const canonicalUrl = url.toString();

  const getCollectionResult = await collectionService.getCollectionDetails({
    channel: region.market.channel,
    languageCode: region.language.code,
    slug,
    limit: DEFAULT_RESULTS_PER_PAGE,
    options: {
      next: {
        revalidate: CACHE_TTL.pdp,
        tags: [`COLLECTION:${slug}`, "DETAIL-PAGE:COLLECTION"],
      },
    },
  });

  const collection = getCollectionResult.data?.results;
  const rawDescription = collection?.description;
  const parsedDescription = editorJSDataToString(rawDescription)?.trim();
  const ogImageUrl = `${clientEnvs.NEXT_PUBLIC_STOREFRONT_URL}/collections/${slug}/opengraph-image`;

  return {
    title: collection?.seoTitle || collection?.name,
    description:
      collection?.seoDescription || parsedDescription.length
        ? parsedDescription.slice(0, 200)
        : collection?.name,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: collection?.name,
        },
      ],
      url: canonicalUrl,
      siteName: "BestElectronics",
    },
  };
}

export default async function Page(props: PageProps) {
  const [searchParams, { slug }, region, collectionService] = await Promise.all(
    [
      props.searchParams,
      props.params,
      getCurrentRegion(),
      getCollectionService(),
    ],
  );

  const { after, before, limit } = searchParams;

  const [getCollectionResult, t] = await Promise.all([
    collectionService.getCollectionDetails({
      channel: region.market.channel,
      languageCode: region.language.code,
      slug,
      limit: limit ? Number.parseInt(limit) : DEFAULT_RESULTS_PER_PAGE,
      after,
      before,
      options: {
        next: {
          revalidate: CACHE_TTL.pdp,
          tags: [`COLLECTION:${slug}`, "DETAIL-PAGE:COLLECTION"],
        },
      },
    }),
    getTranslations("collections"),
  ]);

  if (!getCollectionResult.ok || !getCollectionResult.data.results) {
    notFound();
  }

  const collection = getCollectionResult.data.results;
  const pageInfo = getCollectionResult.data.pageInfo;

  return (
    <ViewModeProvider>
      <div className="mx-auto mb-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs pageName={collection.name} />

        <div className="mt-8 grid basis-full items-center justify-center gap-4 md:flex">
          <h1 className="dark:text-primary text-center text-2xl text-slate-700">
            {collection?.name}
          </h1>
        </div>

        <div className="border-border/60 bg-muted/30 dark:bg-muted/20 relative mx-auto mt-8 aspect-[4/3] w-full max-w-2xl rounded-2xl border p-6 dark:border-white/10">
          {collection?.thumbnail ? (
            <Image
              src={collection.thumbnail.url}
              alt={collection.thumbnail.alt || collection.name}
              fill
              quality={IMAGE_QUALITY.high}
              sizes="(max-width: 960px) 100vw, 50vw"
              className="object-contain"
            />
          ) : null}
        </div>

        <div className="mt-8">
          <RichText contentData={collection?.description} />
        </div>

        <hr className="my-8" />

        <div className="border-border/40 flex items-center justify-between border-b pb-4">
          <h2 className="text-foreground text-2xl font-semibold leading-tight tracking-tight">
            {t("associated-products")}
          </h2>
          <ViewToggleControl />
        </div>

        <section className="mx-auto mt-8 grid gap-8">
          <ProductsListWithMode products={collection.products} />

          {pageInfo && (
            <SearchPagination
              pageInfo={pageInfo}
              searchParams={searchParams}
              baseUrl={paths.collections.asPath({ slug })}
            />
          )}
        </section>
      </div>
    </ViewModeProvider>
  );
}
