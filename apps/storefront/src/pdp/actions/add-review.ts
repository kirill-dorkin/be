"use server";

import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";

import { auth } from "@/auth";
import { appendProductReview, type ProductReview } from "@/pdp/lib/reviews";

type AddReviewResult =
  | { ok: true; reviews: ProductReview[] }
  | { error: string; ok: false };

export const addProductReviewAction = async ({
  productId,
  productSlug,
  rating,
  comment,
}: {
  comment: string;
  productId: string;
  productSlug: string;
  rating: number;
}): Promise<AddReviewResult> => {
  const session = await auth();

  if (!session?.user) {
    return { ok: false, error: "Вы должны войти, чтобы оставить отзыв." };
  }

  const user = session.user as {
    email?: string | null;
    id?: string;
    name?: string | null;
  };

  const safeRating = Math.min(5, Math.max(1, Math.round(rating)));
  const trimmedComment = comment.trim();

  if (trimmedComment.length < 5) {
    return { ok: false, error: "Отзыв слишком короткий." };
  }

  if (trimmedComment.length > 1000) {
    return { ok: false, error: "Отзыв слишком длинный." };
  }

  const review: ProductReview = {
    id: randomUUID(),
    authorId: user.id,
    authorName: user.name || user.email || "Пользователь",
    rating: safeRating,
    comment: trimmedComment,
    createdAt: new Date().toISOString(),
  };

  try {
    const reviews = await appendProductReview(productId, review);

    revalidateTag(`PRODUCT:${productSlug}`);

    return { ok: true, reviews };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Не удалось сохранить отзыв. Попробуйте позже.",
    };
  }
};
