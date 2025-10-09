"use client";

import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { Menu } from "@nimara/domain/objects/Menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@nimara/ui/components/navigation-menu";

import { LocalizedLink } from "@/i18n/routing";
import { isValidJson } from "@/lib/helpers";
import type { Maybe } from "@/lib/types";
import { cn } from "@/lib/utils";

const RichText = dynamic(
  () =>
    import("@nimara/ui/components/rich-text/rich-text").then(
      (mod) => mod.RichText,
    ),
  { ssr: false },
);

const MAX_SUBCATEGORIES_PER_COLUMN = 4;

const splitIntoColumns = <T,>(items: T[], chunkSize: number) => {
  const result: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    result.push(items.slice(index, index + chunkSize));
  }

  return result;
};

export const Navigation = ({ menu }: { menu: Maybe<Menu> }) => {
  const [currentMenuItem, setCurrentMenuItem] = useState("");
  const t = useTranslations("site");

  if (!menu || menu?.items?.length === 0) {
    return null;
  }

  return (
    <NavigationMenu
      aria-label={t("main-navigation")}
      onValueChange={setCurrentMenuItem}
      value={currentMenuItem}
      className="mx-auto hidden max-w-screen-xl pb-2 pt-2 md:flex"
    >
      <NavigationMenuList className="gap-6">
        {menu.items.map((item) => {
          const childrenWithoutImage =
            item.children?.filter((child) => !child.collectionImageUrl) ?? [];

          const childrenWithImage =
            item.children?.filter((child) => child.collectionImageUrl) ?? [];

          const withoutImageColumns = splitIntoColumns(
            childrenWithoutImage,
            MAX_SUBCATEGORIES_PER_COLUMN,
          );

          const columnCount = Math.max(withoutImageColumns.length, 1);
          const shouldWidenColumns = withoutImageColumns.length > 1;
          const hasImageChildren = childrenWithImage.length > 0;
          const leftColumnClass = hasImageChildren
            ? shouldWidenColumns
              ? "col-span-3"
              : "col-span-2"
            : "col-span-6";
          const rightColumnClass = hasImageChildren
            ? withoutImageColumns.length > 0
              ? shouldWidenColumns
                ? "col-span-3"
                : "col-span-4"
              : "col-span-6"
            : "";
          const horizontalGapClass = shouldWidenColumns ? "gap-x-6" : "gap-x-4";

          return (
            <NavigationMenuItem key={item.id}>
              {!!item.children?.length ? (
                <NavigationMenuTrigger
                  asChild
                  onClick={() => setCurrentMenuItem("")}
                >
                  <LocalizedLink
                    href={item.url}
                    className="text-inherit no-underline hover:underline"
                    prefetch={false}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className="relative top-[1px] h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
                      aria-hidden="true"
                    />
                  </LocalizedLink>
                </NavigationMenuTrigger>
              ) : (
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <LocalizedLink
                    href={item.url}
                    className="text-inherit no-underline hover:underline"
                    prefetch={false}
                  >
                    <span>{item.label}</span>
                  </LocalizedLink>
                </NavigationMenuLink>
              )}

              <NavigationMenuContent>
                <div className="bg-background grid w-full grid-cols-6 p-6">
                  {withoutImageColumns.length > 0 && (
                    <div
                      className={cn(
                        "grid gap-y-3 pr-6",
                        leftColumnClass,
                        horizontalGapClass,
                      )}
                      style={{
                        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                      }}
                    >
                      {withoutImageColumns.map((column, columnIndex) => (
                        <div
                          key={`${item.id}-column-${columnIndex}`}
                          className="flex flex-col gap-3"
                        >
                          {column.map((child) => (
                            <LocalizedLink
                              key={child.id}
                              href={child.url}
                              className="hover:bg-accent group block space-y-1 rounded-md p-3"
                              prefetch={false}
                            >
                              <div className="text-sm font-medium leading-none">
                                {child.label}
                              </div>
                              {child.description && (
                                <div className="text-muted-foreground text-sm leading-snug">
                                  {isValidJson(child.description) ? (
                                    <RichText
                                      className="line-clamp-3 py-1"
                                      contentData={child.description}
                                      disableProse
                                    />
                                  ) : (
                                    <p className="py-1">{child.description}</p>
                                  )}
                                </div>
                              )}
                            </LocalizedLink>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {hasImageChildren && (
                    <div
                      className={cn(
                        "grid grid-cols-3 gap-3",
                        rightColumnClass,
                      )}
                    >
                      {childrenWithImage.slice(0, 3).map((child) => (
                        <LocalizedLink
                          key={child.id}
                          href={child.url}
                          className="bg-accent group relative min-h-[270px] overflow-hidden rounded-lg"
                          onClick={() => setCurrentMenuItem("")}
                          prefetch={false}
                        >
                          <div className="relative h-1/2">
                            {child.collectionImageUrl && (
                              <Image
                                src={child.collectionImageUrl}
                                alt={child.label}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="bg-muted/50 flex h-1/2 flex-col justify-start p-6">
                            <div className="relative z-20 space-y-2">
                              <div className="text-lg font-medium leading-none group-hover:underline">
                                {child.label}
                              </div>
                              <div className="text-muted-foreground overflow-hidden text-sm leading-snug">
                                {child.description &&
                                isValidJson(child.description) ? (
                                  <RichText
                                    disableProse
                                    className="line-clamp-3 max-h-[4.5em] overflow-hidden py-1"
                                    contentData={child.description}
                                  />
                                ) : (
                                  <p className="py-1">{child.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </LocalizedLink>
                      ))}
                    </div>
                  )}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
