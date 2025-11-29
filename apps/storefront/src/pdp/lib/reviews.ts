import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";

type RawMetadataEntry = { key: string; value: string | null };

export type ProductReview = {
  id: string;
  authorId?: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const REVIEWS_METADATA_KEY = "reviews";

const saleorFetch = async <T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> => {
  const response = await fetch(clientEnvs.NEXT_PUBLIC_SALEOR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serverEnvs.SALEOR_APP_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Saleor request failed: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};

const parseReviews = (metadata: RawMetadataEntry[] | null | undefined) => {
  if (!metadata?.length) return [];

  const raw = metadata.find((entry) => entry.key === REVIEWS_METADATA_KEY)?.value;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ProductReview[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    return [];
  }

  return [];
};

export const fetchProductReviews = async (productId: string): Promise<ProductReview[]> => {
  const query = /* GraphQL */ `
    query ProductReviews($id: ID!) {
      product(id: $id) {
        metadata {
          key
          value
        }
      }
    }
  `;

  const result = await saleorFetch<{
    data?: { product?: { metadata?: RawMetadataEntry[] | null } | null };
    errors?: Array<{ message: string }>;
  }>(query, { id: productId });

  const metadata = result.data?.product?.metadata;
  return parseReviews(metadata);
};

export const appendProductReview = async (productId: string, review: ProductReview) => {
  const existing = await fetchProductReviews(productId);
  const next = [review, ...existing].slice(0, 50); // keep recent 50

  const mutation = /* GraphQL */ `
    mutation UpdateProductReviews($id: ID!, $input: [MetadataInput!]!) {
      updateMetadata(id: $id, input: $input) {
        errors {
          field
          message
        }
        item {
          id
        }
      }
    }
  `;

  const updateResult = await saleorFetch<{
    data?: { updateMetadata?: { errors?: Array<{ field: string | null; message: string }> | null } };
    errors?: Array<{ message: string }>;
  }>(mutation, {
    id: productId,
    input: [{ key: REVIEWS_METADATA_KEY, value: JSON.stringify(next) }],
  });

  const apiErrors = updateResult.data?.updateMetadata?.errors;
  if (apiErrors?.length) {
    throw new Error(apiErrors.map((e) => e.message).join(", "));
  }

  return next;
};
