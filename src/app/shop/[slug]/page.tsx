import BaseContainer from "@/shared/ui/BaseContainer";
import { shopStore } from "@/shared/lib/shopStore";
import { notFound } from "next/navigation";
import { ProductDetails } from "../_components/ProductDetails";
import type { SerializableProduct } from "../_components/types";

type ProductEntity = ReturnType<typeof shopStore.listProducts>[number];

function serializeProduct(product: ProductEntity): SerializableProduct {
  return {
    ...product,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : null,
    updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : null,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const products = shopStore.listProducts();
  const categories = shopStore.listCategories();
  const tags = shopStore.listTags();

  const product = products.find((item) => item.slug === params.slug);
  if (!product) return notFound();

  const serializableProduct = serializeProduct(product);
  const categoryName = product.categoryId ? categories.find((category) => category._id === product.categoryId)?.name : undefined;
  const relatedTags = (product.tags || [])
    .map((tagId) => tags.find((tag) => tag._id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <BaseContainer>
        <ProductDetails product={serializableProduct} categoryName={categoryName} tags={relatedTags} />
      </BaseContainer>
    </main>
  );
}
