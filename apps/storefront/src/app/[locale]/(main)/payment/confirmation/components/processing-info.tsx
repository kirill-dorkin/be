"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback, useState } from "react";
import { useInterval } from "usehooks-ts";

import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { Spinner } from "@nimara/ui/components/spinner";

import { useRouter } from "@/i18n/routing";

const ProcessingInfoComponent = ({
  errors,
}: {
  errors: { code: AppErrorCode }[];
}) => {
  const [isTimeExceeded, setIsTimeExceeded] = useState(false);
  const t = useTranslations();
  const router = useRouter();

  // Мемоизация обработчика таймаута
  const handleTimeExceeded = useCallback(() => {
    setIsTimeExceeded(true);
  }, []);

  // Мемоизация обработчика refresh
  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  useInterval(handleTimeExceeded, 30 * 1000);
  useInterval(handleRefresh, 3500);

  return (
    <div className="py-32 leading-10">
      {errors.length ? (
        errors.map(({ code }, i) => <p key={i}>{t(`errors.${code}`)}</p>)
      ) : (
        <>
          <p className="text-lg">{t("payment.paymentProcessing")}...</p>
          {isTimeExceeded && (
            <p className="text-gray-500">
              {t("payment.thisTakesLongerThanUsual")}
            </p>
          )}
          <Spinner className="mx-auto mt-4" />
        </>
      )}
    </div>
  );
};

// Мемоизация - индикатор обработки платежа
export const ProcessingInfo = memo(ProcessingInfoComponent, (prevProps, nextProps) => {
  return prevProps.errors.length === nextProps.errors.length;
});
