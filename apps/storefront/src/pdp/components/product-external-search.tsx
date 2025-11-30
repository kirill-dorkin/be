"use client";

import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { memo, useMemo } from "react";

import { Button } from "@nimara/ui/components/button";

type ProductExternalSearchProps = {
  hasImages?: boolean;
  productName: string;
};

const ProductExternalSearchComponent = ({
  productName,
  hasImages = false,
}: ProductExternalSearchProps) => {
  const t = useTranslations("products");
  const locale = useLocale();

  // Мемоизация query и searchUrl
  const query = useMemo(
    () => `${productName} ${t("search-online-query-suffix")}`.trim(),
    [productName, t],
  );
  const searchUrl = useMemo(
    () =>
      `https://www.google.com/search?tbm=isch&hl=${encodeURIComponent(locale)}&q=${encodeURIComponent(query)}`,
    [locale, query],
  );

  // Не показываем кнопку если у товара есть изображения
  if (!productName || hasImages) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col items-start gap-1">
      <Button variant="outline" className="w-full md:w-auto" asChild>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <ExternalLink aria-hidden className="mr-2 h-4 w-4" />
          {t("search-online-button")}
        </a>
      </Button>
      <p className="text-muted-foreground text-xs md:text-sm">
        {t("search-online-disclaimer")}
      </p>
    </div>
  );
};

// Мемоизация - кнопка внешнего поиска товара
export const ProductExternalSearch = memo(
  ProductExternalSearchComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.productName === nextProps.productName &&
      prevProps.hasImages === nextProps.hasImages
    );
  },
);
