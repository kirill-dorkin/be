"use client";

import { useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@nimara/ui/components/button";
import { Label } from "@nimara/ui/components/label";

import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useRegionContext } from "@/regions/client/region-provider";
import type { Market, SupportedLocale } from "@/regions/types";

export function ContinentRow({
  currentLocale,
  markets,
  name,
  onLocaleSelect,
}: {
  currentLocale: SupportedLocale;
  markets: Market[];
  name: string;
  onLocaleSelect: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setLocale } = useRegionContext();

  const onLocaleClick = (locale: SupportedLocale) => {
    if (locale === currentLocale) {
      return;
    }

    onLocaleSelect();

    startTransition(() => {
      setLocale(locale);
      const basePath = pathname ?? "/";
      const search = searchParams.toString();
      const redirectPath = search ? `${basePath}?${search}` : basePath;

      void router.replace(redirectPath, { locale });
    });
  };

  return (
    <>
      <Label className="border-bottom text-slate-700 dark:text-primary block border-b border-stone-200 py-6 text-2xl font-normal leading-8 md:py-10">
        {name}
      </Label>
      <div className="grid grid-cols-2 gap-8 py-4 md:grid-cols-4">
        {markets.map((market) => {
          const locale = market.defaultLanguage.locale;
          const isActive = locale === currentLocale;

          return (
            <div key={market.id} className="flex gap-1 px-1.5 py-2">
              <Button
                key={market.id}
                variant="ghost"
                className={cn(
                  "text-muted-foreground flex h-auto flex-col items-start p-4 text-left text-sm font-normal leading-5",
                  {
                    "pointer-events-none opacity-50": isActive,
                  },
                )}
                onClick={() => onLocaleClick(locale)}
                disabled={isPending || isActive}
              >
                <span>{market.name}</span>
                <span className="text-muted-foreground">
                  {market.defaultLanguage.name}
                </span>
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}

ContinentRow.displayName = "ContinentRow";
