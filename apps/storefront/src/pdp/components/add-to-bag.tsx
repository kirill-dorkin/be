"use client";

import { Loader2,PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import { Button } from "@nimara/ui/components/button";
import { ToastAction } from "@nimara/ui/components/toast";
import { useToast } from "@nimara/ui/hooks";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import type { TranslationMessage } from "@/types";

import { addToBagAction } from "../actions/add-to-bag";
import { removeFromBagAction } from "../actions/remove-from-bag";
import { updateBagAction } from "../actions/update-bag";

type AddToBagProps = {
  cart: Cart | null;
  isVariantAvailable: boolean;
  quantity?: number;
  variantId: string;
};

type ProcessingState = "adding" | "removing" | "updating" | null;

const AddToBagComponent = ({ cart, variantId, isVariantAvailable, quantity = 1 }: AddToBagProps) => {
  const t = useTranslations();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticInCart, setOptimisticInCart] = useState<boolean | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>(null);

  // Actual cart state from server
  const actualIsInCart = useMemo(() => {
    if (!cart || !variantId) {
      return false;
    }

return cart.lines.some((line) => line.variant.id === variantId);
  }, [cart, variantId]);

  // Get cart line info (quantity and lineId)
  const cartLineInfo = useMemo(() => {
    if (!cart || !variantId) {
      return null;
    }

    const line = cart.lines.find((line) => line.variant.id === variantId);

    return line ? { quantity: line.quantity, lineId: line.id } : null;
  }, [cart, variantId]);

  // Check if quantity has changed from what's in cart
  const quantityChanged = useMemo(() => {
    if (!cartLineInfo) {
      return false;
    }

    return cartLineInfo.quantity !== quantity;
  }, [cartLineInfo, quantity]);

  // Clear optimistic state when actual cart data is updated and matches
  useEffect(() => {
    if (optimisticInCart !== null && !isPending) {
      // Check if actual state matches optimistic state
      if (actualIsInCart === optimisticInCart) {
        // Clear optimistic state - actual data has arrived
        setOptimisticInCart(null);
        setProcessingState(null);
      }
    }
  }, [actualIsInCart, optimisticInCart, isPending]);

  // Check if item is already in cart - use optimistic state if available
  const isInCart = useMemo(() => {
    if (optimisticInCart !== null) {
      return optimisticInCart;
    }
    
return actualIsInCart;
  }, [actualIsInCart, optimisticInCart]);

  const handleProductAdd = useCallback(() => {
    startTransition(async () => {
      // Set loading state immediately
      setProcessingState("adding");
      setOptimisticInCart(true);

      const resultLinesAdd = await addToBagAction({
        variantId,
        quantity,
      });

      if (!resultLinesAdd.ok) {
        // Revert optimistic update on error
        setOptimisticInCart(null);
        setProcessingState(null);

        resultLinesAdd.errors.forEach((error) => {
          if (error.field) {
            toast({
              description: t(
                `checkout-errors.${error.field}` as TranslationMessage,
              ),
              variant: "destructive",
            });
          }
        });
      } else {
        toast({
          description: t("common.product-added"),
          action: (
            <ToastAction altText={t("common.go-to-bag")} asChild>
              <LocalizedLink
                href={paths.cart.asPath()}
                className="whitespace-nowrap"
              >
                {t("common.go-to-bag")}
              </LocalizedLink>
            </ToastAction>
          ),
        });

        // Force refresh to update cart state immediately
        router.refresh();
      }
    });
  }, [variantId, quantity, toast, t, router]);

  const handleProductRemove = useCallback(() => {
    startTransition(async () => {
      // Set loading state immediately
      setProcessingState("removing");
      setOptimisticInCart(false);

      const resultLinesRemove = await removeFromBagAction({
        variantId,
      });

      if (!resultLinesRemove.ok) {
        // Revert optimistic update on error
        setOptimisticInCart(null);
        setProcessingState(null);

        resultLinesRemove.errors.forEach((error) => {
          if (error.field) {
            toast({
              description: t(
                `checkout-errors.${error.field}` as TranslationMessage,
              ),
              variant: "destructive",
            });
          }
        });
      } else {
        toast({
          description: t("common.product-removed"),
        });

        // Refresh data in background - optimistic state will clear automatically via useEffect
        router.refresh();
      }
    });
  }, [variantId, toast, t, router]);

  const handleProductUpdate = useCallback(() => {
    if (!cartLineInfo) {
      return;
    }

    startTransition(async () => {
      // Set loading state immediately
      setProcessingState("updating");

      const resultLinesUpdate = await updateBagAction({
        lineId: cartLineInfo.lineId,
        quantity,
      });

      if (!resultLinesUpdate.ok) {
        // Revert on error
        setProcessingState(null);

        resultLinesUpdate.errors.forEach((error) => {
          if (error.field) {
            toast({
              description: t(
                `checkout-errors.${error.field}` as TranslationMessage,
              ),
              variant: "destructive",
            });
          }
        });
      } else {
        toast({
          description: t("common.quantity-updated"),
        });

        // Refresh data to get updated cart
        router.refresh();
        setProcessingState(null);
      }
    });
  }, [cartLineInfo, quantity, toast, t, router]);

  const handleNotifyMe = useCallback(async () => {
    return toast({
      title: t("errors.product.NOT_AVAILABLE"),
      description: t("errors.product.VARIANT_NOT_AVAILABLE"),
      variant: "destructive",
    });
  }, [toast, t]);

  // Show processing state when pending
  const showProcessing = isPending && processingState !== null;

  // Determine button variant with smooth transitions
  const buttonVariant = useMemo(() => {
    if (processingState === "adding") {
      return "default";
    }

    if (processingState === "removing") {
      return "destructive";
    }

    if (processingState === "updating") {
      return "default";
    }

    // If in cart and quantity changed, show update style (default)
    // If in cart and quantity same, show remove style (destructive)
    if (isInCart && quantityChanged) {
      return "default";
    }

    return isInCart ? "destructive" : "default";
  }, [processingState, isInCart, quantityChanged]);

  // Determine button content based on state
  const buttonContent = useMemo(() => {
    // Show processing state
    if (processingState === "adding") {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: t("common.adding-to-bag"),
      };
    }

    if (processingState === "removing") {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: t("common.removing-from-bag"),
      };
    }

    if (processingState === "updating") {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: t("common.updating-quantity"),
      };
    }

    // Show final states
    // If in cart and quantity changed, show update button
    if (isInCart && quantityChanged) {
      return {
        icon: <PlusCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />,
        text: t("common.update-quantity"),
      };
    }

    // If in cart and quantity same, show remove button
    if (isInCart) {
      return {
        icon: <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />,
        text: t("common.remove-from-bag"),
      };
    }

    if (isVariantAvailable) {
      return {
        icon: <PlusCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />,
        text: t("common.add-to-bag"),
      };
    }

    return {
      icon: null,
      text: t("common.notify-me"),
    };
  }, [processingState, isInCart, quantityChanged, isVariantAvailable, t]);

  // Generate key for animation trigger
  const contentKey = `${processingState || ''}-${isInCart ? 'in-cart' : 'not-in-cart'}`;

  return (
    <Button
      className="group relative mt-5 h-12 w-full overflow-hidden text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl md:mt-6 md:h-14 md:text-lg"
      disabled={!variantId || isPending}
      onClick={
        isInCart && quantityChanged
          ? handleProductUpdate
          : isInCart
            ? handleProductRemove
            : isVariantAvailable
              ? handleProductAdd
              : handleNotifyMe
      }
      variant={buttonVariant}
      size="lg"
    >
      <span
        key={contentKey}
        className="relative flex items-center justify-center gap-2 animate-fade-in"
      >
        <span className="inline-flex">
          {buttonContent.icon}
        </span>
        <span className="inline-flex">
          {buttonContent.text}
        </span>
      </span>

      {/* Subtle shine effect on hover */}
      {!isPending && (
        <span className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
      )}

      {/* Progress indicator */}
      {showProcessing && (
        <span className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden rounded-b-md bg-white/10 animate-fade-in">
          <span className="absolute inset-0 animate-progress-bar bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </span>
      )}
    </Button>
  );
};

// Мемоизация - используется на каждой странице товара (PDP)
export const AddToBag = memo(AddToBagComponent, (prevProps, nextProps) => {
  // Check if variant is in prev and next cart
  const prevInCart = prevProps.cart?.lines.some(
    (line) => line.variant.id === prevProps.variantId
  ) ?? false;
  const nextInCart = nextProps.cart?.lines.some(
    (line) => line.variant.id === nextProps.variantId
  ) ?? false;

  return (
    prevProps.variantId === nextProps.variantId &&
    prevProps.isVariantAvailable === nextProps.isVariantAvailable &&
    prevProps.quantity === nextProps.quantity &&
    prevInCart === nextInCart
  );
});
