"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Check, Image as ImageIcon, Send, Tag } from "lucide-react";

import { Button } from "@nimara/ui/components/button";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import { submitListingAction } from "./actions";

type ListingDraft = {
  category: string;
  contact: string;
  description: string;
  photoUrl?: string;
  price: string;
  title: string;
};

export const SellForm = ({ categories = [] }: { categories?: string[] }) => {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const normalizedCategories = useMemo(
    () => categories.filter(Boolean),
    [categories],
  );
  const [selectedCategory, setSelectedCategory] = useState(
    normalizedCategories[0] ?? "",
  );

  // keep success message visible until manual reload
  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [success]);

  const getDraftFromForm = (): ListingDraft | null => {
    const form = formRef.current;
    if (!form) return null;

    const formData = new FormData(form);
    const draft: ListingDraft = {
      title: (formData.get("title") as string) ?? "",
      price: (formData.get("price") as string) ?? "",
      category: (formData.get("category") as string) ?? "",
      description: (formData.get("description") as string) ?? "",
      photoUrl: (formData.get("photoUrl") as string) ?? "",
      contact: (formData.get("contact") as string) ?? "",
    };

    return draft;
  };

  const persistLocalListing = (draft: ListingDraft) => {
    try {
      const existing = localStorage.getItem("be-seller-listings");
      const parsed: ListingDraft[] = existing ? JSON.parse(existing) : [];
      parsed.unshift({ ...draft });
      localStorage.setItem("be-seller-listings", JSON.stringify(parsed.slice(0, 15)));
    } catch {
      // ignore localStorage errors silently
    }
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    const draft = getDraftFromForm();

    startTransition(async () => {
      const result = await submitListingAction(formData);

      if (!result.ok) {
        setSuccess(false);
        setError(result.error ?? "Не удалось отправить заявку");
        return;
      }

      setSuccess(true);
      if (draft) {
        persistLocalListing(draft);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur">
      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-800 ring-1 ring-emerald-100">
          <Check className="h-5 w-5" />
          <div className="leading-tight">
            <p className="font-semibold">Заявка отправлена</p>
            <p className="text-sm">
              Мы получили ваш товар. Публикация произойдет после модерации.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-800 ring-1 ring-red-100">
          {error}
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title" className="font-medium">
            Название товара
          </Label>
          <div className="relative">
            <Tag className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              id="title"
              name="title"
              required
              className="pl-9"
              placeholder="Например, Беспроводные наушники"
              disabled={isPending || success}
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Цена</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              disabled={isPending || success}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Категория</Label>
            {normalizedCategories.length ? (
              <>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value)}
                  disabled={isPending || success}
                >
                  <SelectTrigger className="h-11 rounded-lg border border-border/60 bg-card/70 shadow-sm">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {normalizedCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="category" value={selectedCategory} />
              </>
            ) : (
              <Input
                id="category"
                name="category"
                required
                placeholder="Например, Аудио"
                disabled={isPending || success}
              />
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Описание</Label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            rows={4}
            placeholder="Расскажите об особенностях, комплектации и состоянии"
            disabled={isPending || success}
            className="min-h-[120px] rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none disabled:opacity-50"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="photoUrl">Ссылка на фото (опционально)</Label>
          <div className="relative">
            <ImageIcon className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              id="photoUrl"
              name="photoUrl"
              type="url"
              placeholder="https://"
              className="pl-9"
              disabled={isPending || success}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contact">Контакт для связи</Label>
          <Input
            id="contact"
            name="contact"
            required
            placeholder="Телефон, Telegram или email"
            disabled={isPending || success}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isPending || success}
          className="mt-2 gap-2 font-semibold"
        >
          <Send className="h-4 w-4" />
          Отправить на модерацию
        </Button>
      </form>
    </div>
  );
};
