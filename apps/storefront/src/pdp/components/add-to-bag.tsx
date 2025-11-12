"use client";

import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useCallback, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { ToastAction } from "@nimara/ui/components/toast";
import { useToast } from "@nimara/ui/hooks";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import type { TranslationMessage } from "@/types";

import { addToBagAction } from "../actions/add-to-bag";

type AddToBagProps = {
  isVariantAvailable: boolean;
  variantId: string;
};

const AddToBagComponent = ({ variantId, isVariantAvailable }: AddToBagProps) => {
  const t = useTranslations();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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
    }

    setIsProcessing(false);
  }, [variantId, toast, t]);

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
      onClick={isVariantAvailable ? handleProductAdd : handleNotifyMe}
      loading={isProcessing}
    >
      {isVariantAvailable ? (
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
    prevProps.isVariantAvailable === nextProps.isVariantAvailable
  );
});
