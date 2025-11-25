import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { ShoppingBagSkeleton } from "@/components/shopping-bag";

import { Cart } from "./components/cart";

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t("cart.your-bag"),
  };
}

export default async function Page() {
  return (
    <div className="mx-auto flex justify-center">
      <div className="max-w-[616px] flex-1 basis-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Suspense fallback={<ShoppingBagSkeleton hasHeader />}>
          <Cart />
        </Suspense>
      </div>
    </div>
  );
}
