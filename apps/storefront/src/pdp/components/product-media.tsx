"use client";

import { useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";

import type { Cart } from "@nimara/domain/objects/Cart";
import { type Image } from "@nimara/domain/objects/common";
import type {
  Product,
  ProductAvailability,
} from "@nimara/domain/objects/Product";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nimara/ui/components/carousel";

import { DiscountBadge } from "@/components/discount-badge";
import { OptimizedImage } from "@/components/optimized-image";
import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/config";
import { cn } from "@/lib/utils";
import { ProductMediaEmptyState } from "@/pdp/components/product-media-empty-state";
import { useSelectedVariantImages } from "@/pdp/hooks/useSelectedVariantImage";
import { useVariantSelection } from "@/pdp/hooks/useVariantSelection";

type ProductMediaProps = {
  altTextFallback?: string;
  availability: ProductAvailability;
  cart: Cart | null;
  media: Image[];
  product: Product;
  showAs?: "vertical" | "carousel";
  variants: Product["variants"];
};

export const ProductMedia = ({
  media,
  variants,
  altTextFallback,
  showAs = "vertical",
  availability,
  cart,
  product,
}: ProductMediaProps) => {
  const params = useSearchParams();
  const activeVariantImages = useSelectedVariantImages(variants, media, params);
  const { discountPercent } = useVariantSelection({
    cart,
    product,
    productAvailability: availability,
  });

  if (!media?.length) {
    return (
      <ProductMediaEmptyState
        productName={product.name}
        className={showAs === "carousel" ? "md:aspect-square" : undefined}
      />
    );
  }

  return (
    <>
      <MobileOnlyCarousel
        altTextFallback={altTextFallback}
        images={activeVariantImages}
        discountPercent={discountPercent}
      />

      {showAs === "carousel" ? (
        <ProductMediaCarousel
          images={activeVariantImages}
          altTextFallback={altTextFallback}
          discountPercent={discountPercent}
        />
      ) : (
        <div className="relative max-md:hidden md:col-span-6">
          {discountPercent > 0 && <DiscountBadge discount={discountPercent} />}
          <div className="hidden gap-4 md:grid">
            {activeVariantImages.map(({ url, alt }, i) => (
              <div
                key={url}
                className="bg-muted/30 dark:bg-muted/20 relative flex aspect-square items-center justify-center rounded-lg border border-border/40 p-6 dark:border-white/10"
              >
                <OptimizedImage
                  src={url}
                  alt={alt || altTextFallback || ""}
                  height={IMAGE_SIZES.pdp}
                  width={IMAGE_SIZES.pdp}
                  priority={i === 0}
                  quality={IMAGE_QUALITY.high}
                  highQuality
                  disableGoogleLens
                  sizes="(max-width: 960px) 100vw, 50vw"
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const ProductMediaCarouselComponent = ({
  images,
  altTextFallback,
  discountPercent,
}: {
  altTextFallback?: string;
  discountPercent: number;
  images: Image[];
}) => {
  const [previewImage, setPreviewImage] = useState<Image | null>(
    images.length ? images[0] : null,
  );

  useEffect(() => {
    if (images.length) {
      setPreviewImage(images[0]);
    }
  }, [images]);

  // Мемоизация обработчика клика по миниатюре
  const handleThumbnailClick = useCallback((image: Image) => {
    setPreviewImage(image);
  }, []);

  return (
    <div className="hidden flex-col items-center gap-4 md:flex">
      <div className="bg-muted/30 dark:bg-muted/20 relative flex aspect-square items-center justify-center rounded-lg border border-border/40 p-4 dark:border-white/10">
        {discountPercent > 0 && <DiscountBadge discount={discountPercent} />}
        {previewImage ? (
          <OptimizedImage
            src={previewImage.url}
            alt={previewImage.alt || altTextFallback || ""}
            width={IMAGE_SIZES.pdp}
            height={IMAGE_SIZES.pdp}
            quality={IMAGE_QUALITY.high}
            highQuality
            disableGoogleLens
            className="h-full w-full object-contain"
            priority
          />
        ) : (
          <ProductImagePlaceholder />
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {images?.map((image, i) => (
          <div
            key={image.url}
            className={cn(
              "bg-muted/30 dark:bg-muted/20 square flex aspect-square w-1/6 min-w-20 items-center justify-center rounded-lg border p-2 transition-all hover:border-foreground/40",
              {
                "border-foreground border-2": previewImage?.url === image.url,
                "border-border/40 dark:border-white/10": previewImage?.url !== image.url,
              },
            )}
          >
            <OptimizedImage
              src={image.url}
              alt={image.alt || altTextFallback || ""}
              height={IMAGE_SIZES.thumbnail}
              width={IMAGE_SIZES.thumbnail}
              quality={IMAGE_QUALITY.medium}
              disableGoogleLens
              className="h-full w-full cursor-pointer object-contain"
              priority={i === 0}
              onClick={() => handleThumbnailClick(image)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Мемоизация карусели - предотвращает ре-рендер при изменении родителя
const ProductMediaCarousel = memo(ProductMediaCarouselComponent, (prevProps, nextProps) => {
  return (
    prevProps.discountPercent === nextProps.discountPercent &&
    prevProps.altTextFallback === nextProps.altTextFallback &&
    prevProps.images.length === nextProps.images.length &&
    prevProps.images.every((img, i) => img.url === nextProps.images[i]?.url)
  );
});

const MobileOnlyCarouselComponent = (props: {
  altTextFallback?: string;
  discountPercent: number;
  images: Image[];
}) => (
  <div className="md:hidden">
    <Carousel>
      <CarouselContent>
        {props.images?.map(({ url, alt }, i) => (
          <CarouselItem key={url}>
            <div className="bg-muted/30 dark:bg-muted/20 relative flex aspect-square items-center justify-center rounded-lg border border-border/40 p-4 dark:border-white/10">
              {props.discountPercent > 0 && (
                <DiscountBadge discount={props.discountPercent} />
              )}
              <OptimizedImage
                src={url}
                alt={alt || props.altTextFallback || ""}
                width={IMAGE_SIZES.catalog}
                height={IMAGE_SIZES.catalog}
                priority={i === 0}
                quality={IMAGE_QUALITY.high}
                highQuality
                disableGoogleLens
                loading={i === 0 ? "eager" : "lazy"}
                sizes="(max-width: 960px) 100vw, 1vw"
                className="h-full w-full object-contain"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  </div>
);

// Мемоизация мобильной карусели для оптимизации
const MobileOnlyCarousel = memo(MobileOnlyCarouselComponent, (prevProps, nextProps) => {
  return (
    prevProps.discountPercent === nextProps.discountPercent &&
    prevProps.altTextFallback === nextProps.altTextFallback &&
    prevProps.images.length === nextProps.images.length &&
    prevProps.images.every((img, i) => img.url === nextProps.images[i]?.url)
  );
});
