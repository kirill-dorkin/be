"use client";

import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@nimara/ui/components/button";

type ProductExternalSearchProps = {
  productName: string;
};

export const ProductExternalSearch = ({
  productName,
}: ProductExternalSearchProps) => {
  const t = useTranslations("products");
  const locale = useLocale();

  if (!productName) {
    return null;
  }

  const query = `${productName} ${t("search-online-query-suffix")}`.trim();
  const searchUrl = `https://www.google.com/search?tbm=isch&hl=${encodeURIComponent(
    locale,
  )}&q=${encodeURIComponent(query)}`;

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
