"use client";

import { PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo, useState } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import { Button } from "@nimara/ui/components/button";
import { ToastAction } from "@nimara/ui/components/toast";
import { useToast } from "@nimara/ui/hooks";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import type { TranslationMessage } from "@/types";

import { addToBagAction } from "../actions/add-to-bag";
import { removeFromBagAction } from "../actions/remove-from-bag";

type AddToBagProps = {
  cart: Cart | null;
  isVariantAvailable: boolean;
  variantId: string;
};

const AddToBagComponent = ({ cart, variantId, isVariantAvailable }: AddToBagProps) => {
  const t = useTranslations();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if item is already in cart
  const isInCart = useMemo(() => {
    if (!cart || !variantId) {
      return false;
    }

    return cart.lines.some((line) => line.variant.id === variantId);
  }, [cart, variantId]);

  const handleProductAdd = useCallback(async () => {
    setIsProcessing(true);

    const resultLinesAdd = await addToBagAction({
      variantId,
    });

    if (!resultLinesAdd.ok) {
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
      setIsProcessing(false);
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

      // Small delay to ensure cache is revalidated before refresh
      setTimeout(() => {
        router.refresh();
        setIsProcessing(false);
      }, 300);
    }
  }, [variantId, toast, t, router]);

  const handleProductRemove = useCallback(async () => {
    setIsProcessing(true);

    const resultLinesRemove = await removeFromBagAction({
      variantId,
    });

    if (!resultLinesRemove.ok) {
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
      setIsProcessing(false);
    } else {
      toast({
        description: t("common.product-removed"),
      });

      // Small delay to ensure cache is revalidated before refresh
      setTimeout(() => {
        router.refresh();
        setIsProcessing(false);
      }, 300);
    }
  }, [variantId, toast, t, router]);

  const handleNotifyMe = useCallback(async () => {
    return toast({
      title: t("errors.product.NOT_AVAILABLE"),
      description: t("errors.product.VARIANT_NOT_AVAILABLE"),
      variant: "destructive",
    });
  }, [toast, t]);

  return (
    <Button
      className="w-full"
      disabled={!variantId || isProcessing}
      onClick={
        isInCart
          ? handleProductRemove
          : isVariantAvailable
            ? handleProductAdd
            : handleNotifyMe
      }
      loading={isProcessing}
      variant={isInCart ? "destructive" : "default"}
    >
      {isInCart ? (
        <>
          <Trash2 className="mr-2 h-4" />
          {t("common.remove-from-bag")}
        </>
      ) : isVariantAvailable ? (
        <>
          <PlusCircle className="mr-2 h-4" />
          {t("common.add-to-bag")}
        </>
      ) : (
        t("common.notify-me")
      )}
    </Button>
  );
};

// Мемоизация - используется на каждой странице товара (PDP)
export const AddToBag = memo(AddToBagComponent, (prevProps, nextProps) => {
  return (
    prevProps.variantId === nextProps.variantId &&
    prevProps.isVariantAvailable === nextProps.isVariantAvailable &&
    prevProps.cart?.id === nextProps.cart?.id
  );
});
