"use client";

import Image, { type ImageProps } from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef } from "react";

import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";

import { DiscountBadge } from "@/components/discount-badge";
import { getDiscountInfo, Price } from "@/components/price";
import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const ProductName = ({ children }: PropsWithChildren) => (
  <h2 className="line-clamp-1 overflow-hidden text-ellipsis text-left text-slate-700 dark:text-primary">
    {children}
  </h2>
);

export const ProductThumbnail = ({ alt, ...props }: ImageProps) => (
  <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm dark:border-white/10 dark:bg-card/80 dark:shadow-[0_12px_32px_rgba(15,23,42,0.28)]">
    <Image
      alt={alt}
      fill
      className="object-cover object-top transition-transform duration-200 group-hover:scale-[1.02]"
      {...props}
    />
  </div>
);

type Props = {
  product: SearchProduct;
} & Pick<ImageProps, "height" | "width" | "sizes">;

const isPromiseWithCatch = (value: unknown): value is Promise<unknown> => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return typeof (value as Promise<unknown>).catch === "function";
};

export const SearchProductCard = ({
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
      const maybePromise = router.prefetch(productHref);
      if (isPromiseWithCatch(maybePromise)) {
        maybePromise.catch(() => {
          // Ignore prefetch errors; navigation will fallback to default behaviour.
        });
      }
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
        rootMargin: "200px",
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
