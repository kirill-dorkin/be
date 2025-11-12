"use client";

import { useTranslations } from "next-intl";
import { memo, type ReactNode, useCallback, useState } from "react";

import type { Order } from "@nimara/domain/objects/Order";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

import { ReturnProductsForm } from "../_forms/return-products-form";

const ReturnProductsModalComponent = ({
  children,
  order,
  orderLines,
}: {
  children: ReactNode;
  order: Order;
  orderLines: ReactNode[];
}) => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  // Мемоизация обработчика закрытия
  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-slate-700 dark:text-primary">
          {t("order.return-products")}
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="mb-4">
            {t("order.return-products")}
          </DialogTitle>
        </DialogHeader>
        <ReturnProductsForm
          order={order}
          orderLines={orderLines}
          onCancel={handleClose}
        >
          {children}
        </ReturnProductsForm>
      </DialogContent>
    </Dialog>
  );
};

// Мемоизация - модальное окно возврата товаров
export const ReturnProductsModal = memo(ReturnProductsModalComponent, (prevProps, nextProps) => {
  return (
    prevProps.order.id === nextProps.order.id &&
    prevProps.orderLines.length === nextProps.orderLines.length
  );
});
