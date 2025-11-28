"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";
import { type User } from "@nimara/domain/objects/User";
import { Label } from "@nimara/ui/components/label";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@nimara/ui/components/toggle-group";

import { PriceComparison } from "@/components/membership/price-comparison";
import { Price } from "@/components/price";
import { isVipUser,PRODUCT_VIP_DISCOUNT_PERCENT } from "@/lib/membership/status";
import { cn } from "@/lib/utils";

import { useVariantSelection } from "../hooks/useVariantSelection";
import { AddToBag } from "./add-to-bag";
import { QuantitySelector } from "./quantity-selector";
import { VariantDropdown } from "./variant-dropdown";

type VariantSelectorProps = {
  cart: Cart | null;
  product: Product;
  productAvailability: ProductAvailability;
  user: User | null;
};

export const VariantSelector = ({
  product,
  productAvailability,
  cart,
  user,
}: VariantSelectorProps) => {
  const t = useTranslations();
  const [quantity, setQuantity] = useState(1);
  const {
    allSelectionAttributes,
    areAllRequiredSelectionAttributesChosen,
    chosenAttributes,
    chosenVariant,
    chosenVariantAvailability,
    discriminatedVariantId,
    isChosenVariantAvailable,
    matchingVariants,
    params,
    setDiscriminatedVariantId,
    setParams,
    startPrice,
    variantsAvailability,
  } = useVariantSelection({ cart, product, productAvailability });

  // Calculate prices: regular shown as is; member price is illustrative only
  const regularPrice = chosenVariantAvailability?.price?.amount || 0;
  const memberPrice =
    regularPrice * (1 - PRODUCT_VIP_DISCOUNT_PERCENT / 100);
  const isMember = isVipUser(user);

  // Sync quantity with cart when variant changes or cart updates
  const currentVariantId = matchingVariants?.length > 1
    ? discriminatedVariantId
    : chosenVariant?.id;

  // Sync local quantity state with cart quantity when item is in cart
  useEffect(() => {
    if (currentVariantId && cart) {
      const cartLine = cart.lines.find((line) => line.variant.id === currentVariantId);

      if (cartLine && cartLine.quantity !== quantity) {
        setQuantity(cartLine.quantity);
      }
    }
  }, [cart, currentVariantId, quantity]);

  // Мемоизация проверки бесплатных вариантов
  const hasFreeVariant = useMemo(
    () => variantsAvailability?.some((variant) => variant.price.amount === 0),
    [variantsAvailability]
  );

  // Мемоизация обработчика изменения атрибута
  const handleAttributeChange = useCallback((slug: string, valueSlug: string) => {
    setDiscriminatedVariantId("");
    setParams({
      ...params,
      [slug]: valueSlug,
    }).catch((e) => {
      console.error(e);
    });
  }, [params, setDiscriminatedVariantId, setParams]);

  // Мемоизация обработчика выбора варианта
  const handleVariantSelect = useCallback((variantId: string) => {
    setDiscriminatedVariantId(variantId);
  }, [setDiscriminatedVariantId]);

  return (
    <>
      <div className="border-border/30 dark:border-white/10 my-5 border-t pt-4">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end md:gap-6">
          {/* Price section with membership comparison */}
          <div className="text-left flex-1" aria-live="polite">
            {regularPrice > 0 ? (
              <PriceComparison
                regularPrice={regularPrice}
                memberPrice={memberPrice}
                isMember={isMember}
                size="lg"
                showCTA={!isMember}
                orientation="horizontal"
              />
            ) : (
              <Price
                price={chosenVariantAvailability?.price}
                startPrice={startPrice}
                hasFreeVariants={hasFreeVariant}
                undiscountedPrice={chosenVariantAvailability?.priceUndiscounted}
              />
            )}
          </div>

          {/* Quantity selector */}
          <div className="w-auto">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={50}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {allSelectionAttributes.map(({ slug, name, values, type }, index) => {
          const isPreviousAttributeSelected =
            index === 0 ? true : !!chosenAttributes[index - 1]?.value;

          const chosenAttribute = chosenAttributes.find((val) => {
            if (val.slug === slug) {
              return values.some((v) => v.slug === val.value);
            }

            return false;
          });

          return (
            <div key={slug} className="flex flex-col gap-2">
              <Label id={`label-${slug}`} className="text-foreground text-xs font-medium uppercase tracking-wider">
                {name}
                {type === "SWATCH" &&
                  !!chosenAttribute?.value &&
                  `: ${chosenAttribute.value}`}
              </Label>

              <ToggleGroup
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                value={!chosenAttribute?.value ? null : chosenAttribute?.value}
                type="single"
                disabled={!isPreviousAttributeSelected}
                className={cn(
                  type === "SWATCH"
                    ? "flex justify-start"
                    : "grid grid-cols-2 md:grid-cols-3",
                )}
                aria-labelledby={t("products.label-slug", { slug })}
                onValueChange={(valueSlug) => handleAttributeChange(slug, valueSlug)}
              >
                {values
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(({ slug: valueSlug, name: valueName, value }) => {
                    const isSelected = chosenAttributes.some(
                      (attr) => attr.slug === slug && attr.value === valueSlug,
                    );

                    return type === "SWATCH" ? (
                      <ToggleGroupItem
                        disabled={!isPreviousAttributeSelected}
                        variant="default"
                        key={valueSlug}
                        value={valueSlug}
                        className={cn(
                          cn(
                            "flex max-w-min flex-col hover:bg-transparent data-[state=on]:bg-transparent",
                          ),
                          !isPreviousAttributeSelected && "opacity-50",
                        )}
                        size="default"
                      >
                        <div
                          className={cn(
                            "h-6 w-6 border border-stone-200 transition-all duration-200 hover:scale-110 hover:shadow-md",
                            isSelected && "scale-110 shadow-md",
                          )}
                          style={{
                            backgroundColor: value,
                          }}
                        />

                        <div
                          className={cn(
                            "bg-foreground invisible mt-1 h-[2px] w-6 transition-all duration-200",
                            isSelected && "visible",
                          )}
                        ></div>
                      </ToggleGroupItem>
                    ) : (
                      <ToggleGroupItem
                        disabled={!isPreviousAttributeSelected}
                        variant="outline"
                        key={valueSlug}
                        value={valueSlug}
                        className="h-9 text-sm transition-all duration-200 hover:scale-105 hover:shadow-md data-[state=on]:scale-105 data-[state=on]:shadow-md"
                      >
                        {valueName}
                      </ToggleGroupItem>
                    );
                  })}
              </ToggleGroup>
            </div>
          );
        })}

        {matchingVariants?.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <VariantDropdown
              variants={matchingVariants}
              onVariantSelect={handleVariantSelect}
              selectedVariantId={discriminatedVariantId}
            />
          </div>
        )}
      </div>

      <AddToBag
        cart={cart}
        quantity={quantity}
        variantId={
          matchingVariants?.length > 1
            ? discriminatedVariantId
            : chosenVariant
              ? chosenVariant?.id
              : areAllRequiredSelectionAttributesChosen
                ? "NOTIFY_ME"
                : ""
        }
        isVariantAvailable={
          matchingVariants?.length > 1
            ? true
            : chosenVariant
              ? isChosenVariantAvailable
              : areAllRequiredSelectionAttributesChosen
                ? false
                : true
        }
      />
    </>
  );
};
