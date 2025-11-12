"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useCallback, useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@nimara/ui/components/sheet";

import { SearchForm } from "@/components/header/search-form";
import { usePathname } from "@/i18n/routing";

const MobileSearchComponent = () => {
  const t = useTranslations("search");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Мемоизация обработчика закрытия
  const handleCloseSheet = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Мемоизация обработчика открытия
  const handleOpenSheet = useCallback(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="gap-1 md:hidden"
        aria-label={t("open-search")}
        onClick={handleOpenSheet}
      >
        <Search className="h-4 w-4" />
      </Button>
      <Sheet
        open={isOpen}
        onOpenChange={setIsOpen}
        aria-label={t("search-label")}
        modal={true}
      >
        <SheetContent side="top" closeClassName="hidden">
          <SheetTitle className="sr-only">{t("search-label")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("search-placeholder")}
          </SheetDescription>
          <SearchForm onSubmit={handleCloseSheet} />
        </SheetContent>
      </Sheet>
    </>
  );
};

// Мемоизация - используется в mobile header
export const MobileSearch = memo(MobileSearchComponent);
