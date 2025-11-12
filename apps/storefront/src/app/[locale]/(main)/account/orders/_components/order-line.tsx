import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { OrderLine as OrderLineType } from "@nimara/domain/objects/Order";

import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/config";
import { formatProductName } from "@/lib/format-product-name";
import { getLocalizedFormatter } from "@/lib/formatters/get-localized-formatter";

export const OrderLine = async ({
  line,
  returnStatus,
}: {
  line: OrderLineType;
  returnStatus?: string;
}) => {
  const [t, formatter] = await Promise.all([
    getTranslations(),
    getLocalizedFormatter(),
  ]);

  const isFree = line.totalPrice?.amount === 0;
  const priceLabel = isFree
    ? t("common.free")
    : formatter.price({
        amount: line.totalPrice.amount,
      });
  const lineName = [line?.productName, line?.variantName].join(" • ");
  const quantityLabel = `${t("common.qty")}: ${line.quantity}`;

  return (
    <>
      {line.thumbnail?.url ? (
        <Image
          alt={line.thumbnail.alt ?? ""}
          src={line.thumbnail.url}
          sizes="56px"
          width={IMAGE_SIZES.thumbnail}
          height={IMAGE_SIZES.thumbnail}
          quality={IMAGE_QUALITY.low}
          className="col-span-1 h-[56px] w-[42px] rounded border object-contain p-1 bg-muted/30 dark:bg-muted/20"
        />
      ) : (
        <ProductImagePlaceholder height={56} width={42} />
      )}
      <div className="col-span-3 block sm:hidden">
        <p className="text-slate-700 dark:text-primary break-words">{formatProductName(lineName)}</p>
        <span className="flex gap-2">
          <p className="w-1/3 text-stone-500 dark:text-stone-400">
            {quantityLabel}
          </p>
          <p className="text-slate-700 dark:text-primary w-1/3 text-center font-bold">
            {returnStatus || ""}
          </p>
          <p className="w-1/3 text-end text-stone-500 dark:text-stone-400">
            {priceLabel}
          </p>
        </span>
      </div>
      <p className="text-slate-700 dark:text-primary col-span-5 hidden sm:block break-words">
        {formatProductName(lineName)}
      </p>
      <p className="text-slate-700 dark:text-primary col-span-2 hidden text-center text-sm font-bold sm:block">
        {returnStatus || ""}
      </p>
      <p className="dark:text-muted-foreground col-span-2 hidden text-end text-stone-500 sm:block">
        {quantityLabel}
      </p>
      <p className="dark:text-muted-foreground col-span-2 hidden text-end text-stone-500 sm:block">
        {priceLabel}
      </p>
    </>
  );
};
