"use client";

import type { ImageProps } from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, type PropsWithChildren, useCallback, useEffect, useMemo, useRef } from "react";

import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";

import { DiscountBadge } from "@/components/discount-badge";
import { OptimizedImage } from "@/components/optimized-image";
import { getDiscountInfo, Price } from "@/components/price";
import { IMAGE_QUALITY } from "@/config";
import { LocalizedLink } from "@/i18n/routing";
import { formatProductName } from "@/lib/format-product-name";
import { paths } from "@/lib/paths";

export const ProductName = ({ children }: PropsWithChildren) => {
  const name = typeof children === "string" ? children : String(children);

  return (
    <h2 className="line-clamp-1 overflow-hidden text-ellipsis text-left text-slate-700 dark:text-primary break-words">
      {formatProductName(name)}
    </h2>
  );
};

export const ProductThumbnail = ({ alt, ...props }: ImageProps) => (
  <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-muted/30 p-3 shadow-sm transition-all dark:border-white/10 dark:bg-muted/20 dark:shadow-[0_12px_32px_rgba(15,23,42,0.28)] group-hover:border-border/80 dark:group-hover:border-white/20">
    <div className="relative h-full w-full">
      <OptimizedImage
        alt={alt}
        fill
        loading="lazy"
        quality={IMAGE_QUALITY.high}
        highQuality
        disableGoogleLens
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
        className="object-contain transition-transform duration-200 group-hover:scale-105"
        {...props}
      />
    </div>
  </div>
);

type Props = {
  product: SearchProduct;
} & Partial<Pick<ImageProps, "height" | "width" | "sizes">>;

const SearchProductCardComponent = ({
  product: { slug, thumbnail, name, price, undiscountedPrice, metadata: _metadata },
  sizes,
}: Props) => {
  const t = useTranslations();
  const palette = useMemo(() => getCardPalette(slug || name), [slug, name]);
  const router = useRouter();
  const cardRef = useRef<HTMLElement | null>(null);
  const productHref = paths.products.asPath({ slug });

  const { discountPercent } = getDiscountInfo(price, undiscountedPrice);

  const prefetchProduct = useCallback(() => {
    try {
      router.prefetch(productHref);
    } catch {
      // Swallow errors on best-effort prefetch.
    }
  }, [productHref, router]);

  useEffect(() => {
    const element = cardRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          prefetchProduct();
          obs.disconnect();
        }
      },
      {
        rootMargin: "400px",
        threshold: 0.01,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [prefetchProduct]);

  return (
    <article className="row-span-3" ref={cardRef}>
      <LocalizedLink
        className="group grid gap-2"
        title={t(`search.go-to-product`, { name })}
        href={productHref}
        onPointerEnter={prefetchProduct}
      >
        <div className="relative">
          {thumbnail ? (
            <>
              <ProductThumbnail
                alt={t("products.image-alt", { productName: name })}
                aria-hidden={true}
                aria-label={name}
                src={thumbnail.url}
                sizes={
                  sizes ??
                  "(max-width: 720px) 100vw, (max-width: 1024px) 50vw, (max-width: 1294px) 33vw, 25vw"
                }
              />
              <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/90 px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur dark:border-white/20 dark:bg-muted/80">
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("products.internet-image-label")}
              </div>
            </>
          ) : (
            <ProductThumbnailFallback
              palette={palette}
              title={t("products.media-placeholder-title")}
              subtitle={t("products.grid-placeholder-subtitle")}
              productName={name}
            />
          )}
          <DiscountBadge discount={discountPercent} />
        </div>

        <div>
          <ProductName>{name}</ProductName>
          <Price
            className="text-slate-700 dark:text-primary"
            price={price}
            undiscountedPrice={undiscountedPrice}
          />
        </div>
      </LocalizedLink>
    </article>
  );
};

// Мемоизация компонента для оптимизации ре-рендеров
export const SearchProductCard = memo(SearchProductCardComponent, (prevProps, nextProps) => {
  // Пересоздаем только если изменились ключевые данные продукта
  return (
    prevProps.product.slug === nextProps.product.slug &&
    prevProps.product.price.amount === nextProps.product.price.amount &&
    prevProps.product.undiscountedPrice?.amount === nextProps.product.undiscountedPrice?.amount &&
    prevProps.product.thumbnail?.url === nextProps.product.thumbnail?.url
  );
});

SearchProductCard.displayName = "SearchProductCard";

// Компактная версия карточки для режима 2x2
const CompactProductCardComponent = ({
  product: { slug, thumbnail, name, price, undiscountedPrice },
  sizes,
}: Props) => {
  const t = useTranslations();
  const palette = useMemo(() => getCardPalette(slug || name), [slug, name]);
  const router = useRouter();
  const cardRef = useRef<HTMLElement | null>(null);
  const productHref = paths.products.asPath({ slug });

  const { discountPercent } = getDiscountInfo(price, undiscountedPrice);

  const prefetchProduct = useCallback(() => {
    try {
      router.prefetch(productHref);
    } catch {
      // Swallow errors on best-effort prefetch.
    }
  }, [productHref, router]);

  useEffect(() => {
    const element = cardRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          prefetchProduct();
          obs.disconnect();
        }
      },
      {
        rootMargin: "400px",
        threshold: 0.01,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [prefetchProduct]);

  return (
    <article className="row-span-1" ref={cardRef}>
      <LocalizedLink
        className="group grid gap-1.5"
        title={t(`search.go-to-product`, { name })}
        href={productHref}
        onPointerEnter={prefetchProduct}
      >
        <div className="relative">
          {thumbnail ? (
            <div className="relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted/30 p-2 shadow-sm transition-all dark:border-white/10 dark:bg-muted/20 dark:shadow-[0_8px_24px_rgba(15,23,42,0.22)] group-hover:border-border/80 dark:group-hover:border-white/20">
              <div className="relative h-full w-full">
                <OptimizedImage
                  alt={t("products.image-alt", { productName: name })}
                  aria-hidden={true}
                  aria-label={name}
                  src={thumbnail.url}
                  fill
                  loading="lazy"
                  quality={IMAGE_QUALITY.medium}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                  className="object-contain transition-transform duration-200 group-hover:scale-105"
                  sizes={
                    sizes ??
                    "(max-width: 720px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  }
                />
              </div>
            </div>
          ) : (
            <CompactProductThumbnailFallback
              palette={palette}
              title={t("products.media-placeholder-title")}
              productName={name}
            />
          )}
          <DiscountBadge discount={discountPercent} className="scale-75" />
        </div>

        <div className="px-0.5">
          <h3 className="line-clamp-2 text-sm text-slate-700 dark:text-primary break-words">
            {formatProductName(name)}
          </h3>
          <Price
            className="text-sm text-slate-700 dark:text-primary"
            price={price}
            undiscountedPrice={undiscountedPrice}
          />
        </div>
      </LocalizedLink>
    </article>
  );
};

export const CompactProductCard = memo(CompactProductCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.product.slug === nextProps.product.slug &&
    prevProps.product.price.amount === nextProps.product.price.amount &&
    prevProps.product.undiscountedPrice?.amount === nextProps.product.undiscountedPrice?.amount &&
    prevProps.product.thumbnail?.url === nextProps.product.thumbnail?.url
  );
});

CompactProductCard.displayName = "CompactProductCard";

// List версия карточки для режима списка
const ListProductCardComponent = ({
  product: { slug, thumbnail, name, price, undiscountedPrice },
}: Props) => {
  const t = useTranslations();
  const palette = useMemo(() => getCardPalette(slug || name), [slug, name]);
  const router = useRouter();
  const cardRef = useRef<HTMLElement | null>(null);
  const productHref = paths.products.asPath({ slug });

  const { discountPercent } = getDiscountInfo(price, undiscountedPrice);

  const prefetchProduct = useCallback(() => {
    try {
      router.prefetch(productHref);
    } catch {
      // Swallow errors on best-effort prefetch.
    }
  }, [productHref, router]);

  useEffect(() => {
    const element = cardRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          prefetchProduct();
          obs.disconnect();
        }
      },
      {
        rootMargin: "400px",
        threshold: 0.01,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [prefetchProduct]);

  return (
    <article ref={cardRef}>
      <LocalizedLink
        className="group flex gap-4 rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-all hover:border-border/80 hover:shadow-md dark:border-white/10 dark:bg-card/80 dark:shadow-[0_8px_24px_rgba(15,23,42,0.22)] dark:hover:border-white/20 md:gap-6 md:p-4"
        title={t(`search.go-to-product`, { name })}
        href={productHref}
        onPointerEnter={prefetchProduct}
      >
        <div className="relative w-24 shrink-0 md:w-32">
          {thumbnail ? (
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted/30 p-2 dark:border-white/10 dark:bg-muted/20">
              <OptimizedImage
                alt={t("products.image-alt", { productName: name })}
                aria-hidden={true}
                aria-label={name}
                src={thumbnail.url}
                fill
                loading="lazy"
                quality={IMAGE_QUALITY.medium}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                className="object-contain transition-transform duration-200 group-hover:scale-105"
                sizes="(max-width: 768px) 96px, 128px"
              />
            </div>
          ) : (
            <ListProductThumbnailFallback
              palette={palette}
              productName={name}
            />
          )}
          <DiscountBadge discount={discountPercent} className="scale-75" />
        </div>

        <div className="flex flex-1 flex-col justify-between gap-2 py-1">
          <div>
            <h3 className="line-clamp-2 text-base font-medium text-slate-700 dark:text-primary break-words md:text-lg">
              {formatProductName(name)}
            </h3>
          </div>
          <div className="flex items-center justify-between">
            <Price
              className="text-base text-slate-700 dark:text-primary md:text-lg"
              price={price}
              undiscountedPrice={undiscountedPrice}
            />
          </div>
        </div>
      </LocalizedLink>
    </article>
  );
};

export const ListProductCard = memo(ListProductCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.product.slug === nextProps.product.slug &&
    prevProps.product.price.amount === nextProps.product.price.amount &&
    prevProps.product.undiscountedPrice?.amount === nextProps.product.undiscountedPrice?.amount &&
    prevProps.product.thumbnail?.url === nextProps.product.thumbnail?.url
  );
});

ListProductCard.displayName = "ListProductCard";

const ListProductThumbnailFallback = ({
  palette,
  productName,
}: Pick<ProductThumbnailFallbackProps, "palette" | "productName">) => {
  const initial = productName?.trim().charAt(0)?.toUpperCase() ?? "•";

  return (
    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-card dark:border-white/10 dark:bg-card/80">
      <span
        className={`${palette.accentText} inline-flex h-12 w-12 items-center justify-center rounded-full ${palette.circleBg} text-lg font-semibold`}
        aria-hidden
      >
        {initial}
      </span>
    </div>
  );
};

const CompactProductThumbnailFallback = ({
  palette,
  title,
  productName,
}: Omit<ProductThumbnailFallbackProps, "subtitle">) => {
  const initial = productName?.trim().charAt(0)?.toUpperCase() ?? "•";

  return (
    <div className="relative flex aspect-square flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card p-3 shadow-sm dark:border-white/10 dark:bg-card/80 dark:shadow-[0_8px_24px_rgba(15,23,42,0.26)]">
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur dark:border-white/10 dark:bg-muted/70 dark:text-slate-200">
            {title}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-center">
          <span
            className={`${palette.accentText} inline-flex h-8 w-8 items-center justify-center rounded-full ${palette.circleBg} text-base font-semibold`}
            aria-hidden
          >
            {initial}
          </span>
        </div>
      </div>
    </div>
  );
};

const badgePalette = [
  {
    text: "text-sky-700 dark:text-sky-200",
    circle: "bg-sky-100 dark:bg-sky-900/40",
  },
  {
    text: "text-emerald-700 dark:text-emerald-200",
    circle: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    text: "text-indigo-700 dark:text-indigo-200",
    circle: "bg-indigo-100 dark:bg-indigo-900/40",
  },
  {
    text: "text-amber-700 dark:text-amber-200",
    circle: "bg-amber-100 dark:bg-amber-900/40",
  },
  {
    text: "text-pink-700 dark:text-pink-200",
    circle: "bg-pink-100 dark:bg-pink-900/40",
  },
];

const getCardPalette = (seed: string | undefined) => {
  const fallbackIndex = 0;

  if (!seed?.length) {
    return {
      accentText: badgePalette[fallbackIndex].text,
      circleBg: badgePalette[fallbackIndex].circle,
    };
  }

  const sum = seed
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = sum % badgePalette.length;

  return {
    accentText: badgePalette[index].text,
    circleBg: badgePalette[index].circle,
  };
};

type ProductThumbnailFallbackProps = {
  palette: ReturnType<typeof getCardPalette>;
  productName: string;
  subtitle: string;
  title: string;
};

const ProductThumbnailFallback = ({
  palette,
  title,
  subtitle,
  productName,
}: ProductThumbnailFallbackProps) => {
  const initial = productName?.trim().charAt(0)?.toUpperCase() ?? "•";

  return (
    <div
      className="relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm dark:border-white/10 dark:bg-card/80 dark:shadow-[0_12px_32px_rgba(15,23,42,0.32)]"
    >
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span
            className="inline-flex items-center rounded-full border border-border/60 bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur dark:border-white/10 dark:bg-muted/70 dark:text-slate-200"
          >
            {title}
          </span>
        </div>

        <div className="mt-auto flex items-center gap-3">
          <span
            className={`${palette.accentText} inline-flex h-12 w-12 items-center justify-center rounded-full ${palette.circleBg} text-xl font-semibold`}
            aria-hidden
          >
            {initial}
          </span>
          <p className="text-sm text-muted-foreground dark:text-slate-300">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
