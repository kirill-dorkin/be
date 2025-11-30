"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback, useState } from "react";

import {
  type PaymentMethod,
  type PaymentMethodType,
} from "@nimara/domain/objects/Payment";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";

import { useRouter } from "@/i18n/routing";
import { delay } from "@/lib/core";
import { formatPaymentMethod } from "@/lib/payment";
import { type TranslationMessage } from "@/types";

import { paymentMethodDeleteAction } from "../actions";

const TYPE_MESSAGE_MAPPING: Record<PaymentMethodType, TranslationMessage> = {
  card: "payment.credit-card",
  paypal: "payment.paypal-account",
};

const PaymentMethodDeleteModalComponent = ({
  method: { type, id },
  method,
  onClose,
  customerId,
}: {
  customerId: string;
  method: PaymentMethod;
  onClose: () => void;
}) => {
  const t = useTranslations();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Мемоизация обработчика закрытия
  const handleClose = useCallback(() => {
    if (isProcessing) {
      return;
    }

    onClose();
  }, [isProcessing, onClose]);

  // Мемоизация обработчика удаления
  const handleDelete = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    const result = await paymentMethodDeleteAction({
      customerId,
      paymentMethodId: id,
    });

    if (!result.ok) {
      alert("Could not delete method");
    } else {
      router.refresh();
      await delay();
      onClose();
    }

    setIsProcessing(false);
  }, [isProcessing, customerId, id, router, onClose]);

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="gap-6" withCloseButton={!isProcessing}>
        <DialogHeader>
          <DialogTitle className="dark:text-primary mb-2 text-slate-700">
            {t("common.delete")} {t(TYPE_MESSAGE_MAPPING[type])}
          </DialogTitle>

          <DialogDescription className="dark:text-muted-foreground text-stone-700">
            {t("account.payment-method-delete-info")}
          </DialogDescription>
        </DialogHeader>

        <p
          className="dark:text-primary whitespace-pre-wrap text-sm leading-5 text-slate-700"
          dangerouslySetInnerHTML={{
            __html: formatPaymentMethod({ t, method }),
          }}
        />

        <div className="flex w-full justify-end gap-4">
          <Button
            onClick={handleDelete}
            disabled={isProcessing}
            loading={isProcessing}
          >
            {t("common.delete")}
          </Button>
          <Button
            disabled={isProcessing}
            variant="outline"
            onClick={handleClose}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Мемоизация - модальное окно удаления метода оплаты
export const PaymentMethodDeleteModal = memo(
  PaymentMethodDeleteModalComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.method.id === nextProps.method.id &&
      prevProps.customerId === nextProps.customerId
    );
  },
);
