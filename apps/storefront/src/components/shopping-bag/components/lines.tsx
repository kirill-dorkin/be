"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { type CheckoutProblems } from "@nimara/domain/objects/Checkout";
import type { Line as LineType } from "@nimara/domain/objects/common";

import { Line, type LineProps } from "./line";

export type LinesProps = Pick<
  LineProps,
  "onLineDelete" | "onLineQuantityChange"
> & {
  isDisabled?: boolean;
  isLinesEditable?: boolean;
  lines: LineType[];
  problems: CheckoutProblems;
};

export const Lines = ({
  isLinesEditable = true,
  problems,
  ...props
}: LinesProps) => {
  const t = useTranslations();

  // Мемоизация списка товаров с проблемами для производительности
  const linesWithProblems = useMemo(
    () => [
      ...problems.insufficientStock,
      ...problems.variantNotAvailable,
    ],
    [problems.insufficientStock, problems.variantNotAvailable]
  );

  // Мемоизация фильтрации товаров без проблем
  const lines = useMemo(
    () => props.lines.filter(
      ({ id }) => !linesWithProblems.some(({ line }) => line.id === id),
    ),
    [props.lines, linesWithProblems]
  );

  return (
    <>
      <div className="flex flex-col gap-4 py-6 sm:gap-5 sm:py-8">
        {lines.map((line) => (
          <Line
            key={line.id}
            line={line}
            {...props}
            isLineEditable={isLinesEditable}
          />
        ))}

        {linesWithProblems.map(({ line }) => (
          <div key={line.id} className="space-y-3">
            <h2 className="text-muted-foreground text-sm font-medium">{t("cart.unavailable-products")}</h2>
            <Line
              line={line}
              {...props}
              isLineEditable={true}
              isOutOfStock
            />
          </div>
        ))}
      </div>
      <hr className="border-border/60" />
    </>
  );
};
