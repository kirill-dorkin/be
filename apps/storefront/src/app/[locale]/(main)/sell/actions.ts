"use server";

import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { saveMarketplaceListing } from "@/lib/marketplace-storage";
import { getCurrentRegion } from "@/regions/server";
import { getSearchService } from "@/services/search";

const listingSchema = z.object({
  title: z.string().min(3, "Название слишком короткое"),
  price: z.coerce.number().min(0, "Цена не может быть отрицательной"),
  category: z.string().min(2, "Укажите категорию"),
  description: z.string().min(10, "Опишите товар"),
  photoUrl: z
    .string()
    .url("Некорректная ссылка на фото")
    .optional()
    .or(z.literal("")),
  contact: z.string().min(5, "Укажите контакт для связи"),
});

export type SubmitListingInput = z.infer<typeof listingSchema>;

export const submitListingAction = async (formData: FormData) => {
  const session = await auth();

  if (!session?.user) {
    return { ok: false as const, error: "Нужно войти, чтобы добавить товар." };
  }

  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    price: formData.get("price"),
    category: formData.get("category"),
    description: formData.get("description"),
    photoUrl: formData.get("photoUrl"),
    contact: formData.get("contact"),
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues.map((issue) => issue.message).join("\n"),
    };
  }

  const payload = parsed.data;
  const photoFile = formData.get("photoFile") as File | null;
  let photoUrlToStore = payload.photoUrl || "";

  if (photoFile && photoFile.size > 0) {
    // Для MVP сохраняем data URL прямо в payload; в будущем — загрузка в Saleor/file storage.
    try {
      const arrayBuffer = await photoFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      photoUrlToStore = `data:${photoFile.type};base64,${base64}`;
    } catch {
      // ignore file read errors
    }
  }

  // Persist listing locally (filesystem) to simulate marketplace feed
  try {
    await saveMarketplaceListing({
      id: randomUUID(),
      title: payload.title,
      price: payload.price,
      category: payload.category,
      description: payload.description,
      photoUrl: photoUrlToStore,
      contact: payload.contact,
      userId: (session.user as { id?: string })?.id,
      userName:
        session.user?.firstName && session.user?.lastName
          ? `${session.user.firstName} ${session.user.lastName}`
          : (session.user?.email ?? "Пользователь"),
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  } catch {
    // ignore fs errors to not block user
  }

  // Try to refresh marketplace cache after submission
  try {
    const region = await getCurrentRegion();
    const searchService = await getSearchService();
    // light-weight query to warm cache (no errors if fails)

    await searchService.search(
      {
        query: "",
        limit: 1,
        sortBy: "name-asc",
        filters: {},
      },
      {
        currency: region.market.currency,
        channel: region.market.channel,
        languageCode: region.language.code,
      },
    );
    revalidateTag("search:results");
  } catch {
    // ignore cache warm errors
  }

  return { ok: true as const };
};
