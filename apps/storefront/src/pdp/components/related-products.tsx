"use client";

import { memo } from "react";

import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nimara/ui/components/carousel";

import { SearchProductCard } from "@/components/search-product-card";

const RelatedProductsComponent = ({
  products,
  title,
}: {
  products: SearchProduct[];
  title: string;
}) => {
  return (
    <div className="border-border/30 dark:border-white/10 relative mt-16 overflow-hidden border-t pt-12">
      <h2 className="text-foreground mb-8 text-2xl font-bold leading-tight tracking-tight md:text-3xl">
        {title}
      </h2>
      <Carousel>
        <CarouselContent className="-ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="flex h-auto w-4/5 flex-none flex-col pl-4 md:w-1/5"
            >
              <SearchProductCard
                product={product}
                sizes="(max-width: 360px) 195px, (max-width: 720px) 379px, 1vw"
                height={200}
                width={200}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

// Мемоизация для предотвращения лишних ре-рендеров карусели
export const RelatedProducts = memo(RelatedProductsComponent, (prevProps, nextProps) => {
  // Пересоздаем только если изменился список товаров и заголовок
  return prevProps.products.length === nextProps.products.length &&
    prevProps.products.every((product, index) => product.id === nextProps.products[index]?.id) &&
    prevProps.title === nextProps.title;
});
