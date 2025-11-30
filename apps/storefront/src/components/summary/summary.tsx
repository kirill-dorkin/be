import { getTranslations } from "next-intl/server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type User } from "@nimara/domain/objects/User";

import { ShoppingBag } from "@/components/shopping-bag";
import { CheckoutMembershipSavings } from "@/components/shopping-bag/components/checkout-membership-savings";

export const Summary = async ({
  checkout,
  user,
}: {
  checkout: Checkout;
  user: User | null;
}) => {
  const t = await getTranslations("cart");

  return (
    <ShoppingBag>
      <ShoppingBag.Header
        header={t("your-bag")}
        totalPrice={checkout.totalPrice.gross}
      />
      <ShoppingBag.Lines
        lines={checkout.lines}
        isLinesEditable={false}
        problems={checkout.problems}
      />
      <ShoppingBag.DiscountCode checkout={checkout} />
      <ShoppingBag.Pricing>
        <ShoppingBag.Subtotal price={checkout.subtotalPrice.gross} />
        <CheckoutMembershipSavings checkout={checkout} user={user} />
        <ShoppingBag.Shipping price={checkout.shippingPrice.gross} />
        {!!checkout?.discount?.amount && (
          <ShoppingBag.Discount discount={checkout.discount} />
        )}
        <ShoppingBag.Total price={checkout.totalPrice.gross} />
      </ShoppingBag.Pricing>
    </ShoppingBag>
  );
};

Summary.displayName = "Summary";
