"use client";

import { PlusIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { memo, useCallback, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Spinner } from "@nimara/ui/components/spinner";

import { cn } from "@/lib/utils";
import { storefrontLogger } from "@/services/logging";

import { generateSecretAction } from "../actions";

const PaymentMethodAddModal = dynamic(
  () =>
    import("./payment-method-add-modal").then((mod) => ({
      default: mod.PaymentMethodAddModal,
    })),
  {
    ssr: false,
  },
);

const AddNewPaymentTriggerComponent = ({
  variant,
  customerId,
  storeUrl,
}: {
  customerId: string;
  storeUrl: string;
  variant: "outline" | "default";
}) => {
  const t = useTranslations();
  const [secret, setSecret] = useState<string | null>(null);

  // Мемоизация обработчика генерации secret
  const handleGenerateSecret = useCallback(async () => {
    const resultGenerateSecret = await generateSecretAction({ customerId });

    if (!resultGenerateSecret.ok) {
      storefrontLogger.error("Error generating payment method secret", {
        errors: resultGenerateSecret.errors,
      });

      return;
    }

    setSecret(resultGenerateSecret.data.secret);
  }, [customerId]);

  // Мемоизация обработчика закрытия
  const handleClose = useCallback(() => setSecret(null), []);

  return (
    <>
      <Button
        onClick={handleGenerateSecret}
        variant={variant}
        disabled={!!secret}
        className={cn(
          "flex gap-1.5",
          variant === "outline" && "dark:text-primary text-slate-700",
        )}
      >
        {secret ? (
          <Spinner className="size-4" />
        ) : (
          <PlusIcon className="size-4" />
        )}
        <span className="max-sm:hidden">{t("payment.add-new-method")}</span>
      </Button>

      {secret && (
        <PaymentMethodAddModal
          onClose={handleClose}
          secret={secret}
          storeUrl={storeUrl}
        />
      )}
    </>
  );
};

// Мемоизация - триггер добавления метода оплаты
export const AddNewPaymentTrigger = memo(
  AddNewPaymentTriggerComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.customerId === nextProps.customerId &&
      prevProps.variant === nextProps.variant &&
      prevProps.storeUrl === nextProps.storeUrl
    );
  },
);
