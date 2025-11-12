"use client";

import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";

import { Line } from "@/components/shopping-bag/components/line";
import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

type ErrorDialogProps = {
  checkout: Checkout;
};

const ErrorDialogComponent = ({ checkout }: ErrorDialogProps) => {
  const t = useTranslations();

  const unavailableLinesNumber = checkout.problems.insufficientStock.length;

  // Мемоизация заголовка и описания
  const dialogContent = useMemo(() => ({
    title: t(
      unavailableLinesNumber === 1
        ? "stock-errors.some-of-products-unavailable"
        : "stock-errors.products-unavailable"
    ),
    message: t(
      unavailableLinesNumber === 1
        ? "stock-errors.some-of-products-message"
        : "stock-errors.products-message"
    ),
  }), [unavailableLinesNumber, t]);

  return (
    <Dialog open>
      <DialogContent
        withCloseButton={false}
        className="bg-white sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>{dialogContent.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <DialogDescription>{dialogContent.message}</DialogDescription>
        </div>
        <div className="grid gap-4 py-4">
          {checkout.problems.insufficientStock.map(({ line }) => (
            <Line key={line.id} line={line} isLineEditable={false} />
          ))}
        </div>
        <DialogFooter>
          <div className="grid w-full gap-4">
            <DialogClose asChild>
              <Button asChild>
                <LocalizedLink href={paths.cart.asPath()}>
                  {t("stock-errors.back-to-cart")}
                </LocalizedLink>
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Мемоизация - отображается при проблемах с наличием товара
export const ErrorDialog = memo(ErrorDialogComponent, (prevProps, nextProps) => {
  return (
    prevProps.checkout.problems.insufficientStock.length === nextProps.checkout.problems.insufficientStock.length &&
    prevProps.checkout.problems.insufficientStock.every((item, i) =>
      item.line.id === nextProps.checkout.problems.insufficientStock[i]?.line.id
    )
  );
});
