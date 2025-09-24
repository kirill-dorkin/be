"use client";
import { Product } from "@/shared/types";
import { useCart } from "@/providers/CartProvider";
import { Button } from "@/shared/ui/button";

export function CartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  return (
    <Button onClick={() => addToCart(product)}>
      В корзину
    </Button>
  );
}


