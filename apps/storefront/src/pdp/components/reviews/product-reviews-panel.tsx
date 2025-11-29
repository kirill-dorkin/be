"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertCircle, Star } from "lucide-react";

import { Button } from "@nimara/ui/components/button";
import { Label } from "@nimara/ui/components/label";

import { addProductReviewAction } from "@/pdp/actions/add-review";
import { type ProductReview } from "@/pdp/lib/reviews";

type Props = {
  productId: string;
  productSlug: string;
  initialReviews: ProductReview[];
  isAuthenticated: boolean;
};

const Stars = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5 text-amber-500">
    {Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        className={`h-4 w-4 ${idx < value ? "fill-amber-400" : "stroke-amber-400"}`}
      />
    ))}
  </div>
);

export const ProductReviewsPanel = ({
  productId,
  productSlug,
  initialReviews,
  isAuthenticated,
}: Props) => {
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    return Math.round(
      (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10,
    ) / 10;
  }, [reviews]);

  const handleSubmit = () => {
    setError(null);

    startTransition(async () => {
      const result = await addProductReviewAction({
        productId,
        productSlug,
        rating,
        comment,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setReviews(result.reviews);
      setComment("");
      setRating(5);
    });
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 shadow-inner">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Отзывы</h3>
          <p className="text-muted-foreground text-sm">
            Оставьте отзыв о товаре. Отзывы отображаются сразу.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-sm text-foreground ring-1 ring-border/60">
          <Stars value={Math.round(average)} />
          <span className="font-semibold">
            {reviews.length ? `${average} / 5` : "—"}
          </span>
          <span className="text-muted-foreground text-xs">
            ({reviews.length})
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-100">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-6">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="rating">Оценка</Label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              disabled={!isAuthenticated || isPending}
              className="h-10 w-28 rounded-lg border border-border/60 bg-card/70 px-3 text-sm shadow-sm focus:border-primary focus:outline-none"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="comment">Комментарий</Label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Поделитесь опытом использования товара"
              disabled={!isAuthenticated || isPending}
              rows={3}
              className="min-h-[110px] w-full rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="h-12 w-full sm:w-48"
          onClick={handleSubmit}
          disabled={!isAuthenticated || isPending}
        >
          {isAuthenticated ? "Оставить отзыв" : "Войдите, чтобы оставить отзыв"}
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {reviews.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/70 bg-card/60 p-3 text-sm text-muted-foreground">
            Пока нет отзывов. Станьте первым!
          </div>
        )}

        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-border/60 bg-card/70 p-3 shadow-sm"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-semibold text-foreground">{review.authorName}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Stars value={review.rating} />
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-foreground leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
