import { revalidateTag } from "@/lib/cache";
import { verifySaleorWebhookSignature } from "@/lib/webhooks";
import { storefrontLogger } from "@/services/logging";

const logger = storefrontLogger;

type CategoryEventSubscriptionFragment =
  | {
      __typename: "CategoryCreated" | "CategoryUpdated" | "CategoryDeleted";
      category: { slug: string | null } | null;
    }
  | {
      __typename: string;
      category?: { slug?: string | null } | null;
    };

const getCategorySlug = (
  payload: CategoryEventSubscriptionFragment,
): string | undefined => {
  switch (payload.__typename) {
    case "CategoryCreated":
    case "CategoryUpdated":
    case "CategoryDeleted":
      return payload.category?.slug ?? undefined;
    default:
      return undefined;
  }
};

export async function POST(request: Request) {
  await verifySaleorWebhookSignature(request);

  const payload = (await request.json()) as CategoryEventSubscriptionFragment;

  const slug = getCategorySlug(payload);

  const tagsToInvalidate: RevalidateTag[] = ["CMS:navbar", "CMS:footer"];

  for (const tag of tagsToInvalidate) {
    revalidateTag(tag);
  }

  logger.debug("[Category webhook] Revalidated CMS navigation tags.", {
    slug,
    typename: payload.__typename,
  });

  return Response.json({ status: "revalidated" });
}
