"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { AlertCircle, CheckIcon, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { memo, useEffect, useState } from "react";
import { useWindowSize } from "usehooks-ts";

import type {
  Line as LineType,
  TaxedPrice,
} from "@nimara/domain/objects/common";
import { Button } from "@nimara/ui/components/button";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@nimara/ui/components/sheet";
import { screenSizes } from "@nimara/ui/consts";
import { cn } from "@nimara/ui/lib/utils";

import { Price } from "@/components/price"; // Adjust the path as needed
import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/config";
import { LocalizedLink } from "@/i18n/routing";
import { formatProductName } from "@/lib/format-product-name";
import { paths } from "@/lib/paths";

type LineQuantityChange = (lineId: string, quantity: number) => Promise<void>;

export type LineProps = {
  isDisabled?: boolean;
  isLineEditable?: boolean;
  isOutOfStock?: boolean;
  line: LineType;
  onLineDelete?(lineId: string): Promise<void>;
  onLineQuantityChange?: LineQuantityChange;
};

const LineComponent = ({
  line: {
    thumbnail,
    product,
    variant,
    id,
    quantity,
    undiscountedTotalPrice,
    total,
  },
  isDisabled,
  onLineQuantityChange,
  onLineDelete,
  isLineEditable = true,
  isOutOfStock = false,
}: LineProps) => {
  const [value, setValue] = useState(quantity.toString());
  const [isOpen, setIsOpen] = useState(false);
  const [showMaxQuantityWarning, setShowMaxQuantityWarning] = useState(false);
  const { width } = useWindowSize();
  const isSmDown = width && width < screenSizes.sm;

  const t = useTranslations();
  const inputValue = useDebounce(value, 1000);

  const attributeNames = variant.selectionAttributes
    ?.map((attr) => attr.values?.[0]?.name)
    .filter(Boolean)
    .join(" • ");

  const name = `${product.name}${attributeNames ? ` • ${attributeNames}` : ""}`;

  const href = paths.products.asPath({ slug: product.slug, hash: variant.id });

  const undiscountedLineTotal: TaxedPrice = {
    amount: undiscountedTotalPrice.amount,
    currency: undiscountedTotalPrice.currency,
    type: "gross",
  };

  const finalLineTotal: TaxedPrice = {
    amount: total.amount,
    currency: total.currency,
    type: "gross",
  };
  const handleLineDelete = async () => {
    await onLineDelete?.(id);
  };

  const handleQuantityChange = (qty: number) => {
    setValue(qty.toString());
    void onLineQuantityChange?.(id, qty);
    setIsOpen(false);
  };

  useEffect(() => {
    if (value === quantity.toString()) {
      return;
    }
    let qty = Number(inputValue);

    if (inputValue === "" || isNaN(qty) || qty < 1) {
      setValue("1");
      qty = 1;

      return;
    }

    if (qty > variant.maxQuantity) {
      setValue(variant.maxQuantity.toString());
      qty = variant.maxQuantity;
      setShowMaxQuantityWarning(true);
    } else {
      setValue(qty.toString());
      if (qty < variant.maxQuantity) {
        setShowMaxQuantityWarning(false);
      }
    }

    void onLineQuantityChange?.(id, qty);
  }, [inputValue]);

  useEffect(() => {
    if (isOpen && !isSmDown) {
      setIsOpen(false);
    }
  }, [width]);

  return (
    <div className="border-border/50 bg-card hover:border-border/80 group relative flex flex-col gap-3 rounded-xl border p-4 pr-12 transition-all duration-200 hover:shadow-md md:flex-row md:items-center md:gap-4 md:p-5 md:pr-5">
      <div className="flex gap-3 md:gap-4">
        <LocalizedLink title={name} href={href} className="block shrink-0">
          {thumbnail ? (
            <Image
              src={thumbnail.url}
              alt={thumbnail.alt ?? name}
              sizes="96px"
              width={IMAGE_SIZES.thumbnail}
              height={IMAGE_SIZES.thumbnail}
              quality={IMAGE_QUALITY.low}
              className={cn(
                "border-border/40 bg-muted/30 h-20 w-20 rounded-lg border object-cover transition-all duration-200 hover:scale-105 sm:h-24 sm:w-24",
                isOutOfStock && "opacity-50 grayscale",
              )}
            />
          ) : (
            <ProductImagePlaceholder
              height={96}
              width={96}
              className={cn(
                "rounded-lg",
                isOutOfStock && "opacity-50 grayscale",
              )}
            />
          )}
        </LocalizedLink>

        <div className="flex flex-1 flex-col gap-2">
          <LocalizedLink title={name} href={href} className="group/title">
            <h3
              className={cn(
                "group-hover/title:text-primary text-sm font-semibold leading-tight transition-colors sm:text-base",
                {
                  "text-muted-foreground opacity-60": isOutOfStock,
                },
              )}
            >
              {formatProductName(name)}
            </h3>
          </LocalizedLink>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {isLineEditable ? (
              <div className="flex items-center gap-1.5">
                <Label
                  className={cn(
                    isOutOfStock ? "text-stone-500" : "text-muted-foreground",
                    "text-xs",
                  )}
                  htmlFor={`${id}:qty`}
                >
                  {t("common.qty")}
                </Label>
                <div className="hidden sm:block">
                  <Input
                    name={`${id}:qty`}
                    className={cn(
                      isOutOfStock
                        ? "text-stone-400"
                        : "text-stone-700 dark:text-stone-300",
                      "h-8 w-16 px-2 text-center text-sm",
                    )}
                    type="number appearance-none"
                    disabled={isDisabled}
                    value={value}
                    onChange={(evt) => setValue(evt.target.value)}
                    inputMode="numeric"
                    data-testid="cart-product-line-qty"
                    id={`${id}:qty`}
                  />
                </div>
                <div className="block sm:hidden">
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetContent
                      side="bottom"
                      className="max-h-[60vh] overflow-y-auto"
                    >
                      <SheetHeader className="sr-only">
                        <SheetTitle>{t("common.qty")}</SheetTitle>
                      </SheetHeader>
                      <ul>
                        {Array.from(
                          { length: variant.maxQuantity },
                          (_, i) => i + 1,
                        ).map((qty) => (
                          <li
                            key={`${id}-${qty}`}
                            className="flex cursor-pointer"
                            onClick={() => {
                              handleQuantityChange(qty);
                              setIsOpen(false);
                            }}
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start p-1.5"
                            >
                              <CheckIcon
                                className={cn(
                                  "invisible mr-2 h-auto w-[20px]",
                                  {
                                    visible: qty === quantity,
                                  },
                                )}
                              />
                              {qty}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </SheetContent>
                  </Sheet>
                  <Select
                    disabled={isDisabled}
                    open={isOpen}
                    onValueChange={(qty) => handleQuantityChange(Number(qty))}
                    onOpenChange={() => setIsOpen(true)}
                    value={value}
                    aria-expanded={isOpen}
                    aria-controls="qty-select-options"
                  >
                    <SelectTrigger
                      className="h-8 w-auto min-w-[64px] gap-1 px-2 text-sm"
                      aria-labelledby={`${id}:qty`}
                    >
                      <SelectValue placeholder={t("common.qty")} />
                    </SelectTrigger>
                    <SelectContent className="overflow-y-auto">
                      {Array.from(
                        { length: variant.maxQuantity },
                        (_, i) => i + 1,
                      ).map((qty) => (
                        <SelectItem key={qty} value={qty.toString()}>
                          {qty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <p
                className="text-muted-foreground text-xs"
                data-testid="product-qty"
              >
                {t("common.qty")}: {value}
              </p>
            )}

            <div
              className={cn("flex items-center", {
                "text-muted-foreground opacity-60": isOutOfStock,
              })}
              data-testid="shopping-bag-product-line-price"
            >
              <Price
                price={finalLineTotal}
                undiscountedPrice={undiscountedLineTotal}
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      {isLineEditable && (
        <Button
          variant="ghost"
          size="icon"
          disabled={isDisabled}
          onClick={handleLineDelete}
          aria-label={t("cart.remove-button")}
          className="hover:bg-destructive/10 hover:text-destructive absolute right-3 top-3 md:relative md:right-0 md:top-0 md:ml-auto"
        >
          <X height={18} width={18} />
        </Button>
      )}
      {showMaxQuantityWarning && (
        <div className="flex w-full items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            {t("cart.max-quantity", { maxQuantity: variant.maxQuantity })}
          </span>
        </div>
      )}
    </div>
  );
};

// Мемоизация компонента для оптимизации ре-рендеров корзины
export const Line = memo(LineComponent, (prevProps, nextProps) => {
  // Пересоздаем только если изменились ключевые данные линии
  return (
    prevProps.line.id === nextProps.line.id &&
    prevProps.line.quantity === nextProps.line.quantity &&
    prevProps.line.total.amount === nextProps.line.total.amount &&
    prevProps.line.undiscountedTotalPrice.amount ===
      nextProps.line.undiscountedTotalPrice.amount &&
    prevProps.line.thumbnail?.url === nextProps.line.thumbnail?.url &&
    prevProps.isDisabled === nextProps.isDisabled &&
    prevProps.isLineEditable === nextProps.isLineEditable &&
    prevProps.isOutOfStock === nextProps.isOutOfStock
  );
});
