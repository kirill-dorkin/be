"use client";

import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { type PaymentMethod } from "@nimara/domain/objects/Payment";
import { Button } from "@nimara/ui/components/button";

import { formatPaymentMethod, groupPaymentMethods } from "@/lib/payment";
import { type TranslationMessage } from "@/types";

const PaymentMethodDeleteModal = dynamic(
  () =>
    import("./payment-method-delete-modal").then((mod) => ({
      default: mod.PaymentMethodDeleteModal,
    })),
  {
    ssr: false,
  },
);

export const PaymentMethodsList = ({
  methods,
  customerId,
}: {
  customerId: string;
  methods: PaymentMethod[];
}) => {
  const t = useTranslations();
  const groupedMethods = groupPaymentMethods(methods);
  const [selectedMethod, setSelectedMethod] = useState<null | PaymentMethod>(
    null,
  );

  const handleDeleteModalClose = () => setSelectedMethod(null);

  const defaultMethodBadge = (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200">
      {t("payment.default-method")}
    </span>
  );

  return (
    <div className="grid gap-8">
      {Object.entries(groupedMethods).map(([type, methods]) => (
        <div key={type} className="w-full space-y-3">
          <p className="dark:text-primary text-lg font-semibold leading-7 text-slate-700">
            {t(`payment.${type}` as TranslationMessage)}
          </p>
          <div className="grid gap-4">
            {methods.map((method) => (
              <div
                key={method.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100/80 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div
                  className="dark:text-primary flex-1 text-sm text-slate-700"
                  dangerouslySetInnerHTML={{
                    __html: formatPaymentMethod({ t, method }),
                  }}
                />
                <div className="flex flex-col gap-2 sm:items-end">
                  {method.isDefault && (
                    <div className="flex justify-end">{defaultMethodBadge}</div>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMethod(method)}
                    className="w-full sm:w-auto"
                  >
                    <X className="mr-1.5 size-4" />
                    {t("common.delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedMethod && (
        <PaymentMethodDeleteModal
          customerId={customerId}
          method={selectedMethod}
          onClose={handleDeleteModalClose}
        />
      )}
    </div>
  );
};
