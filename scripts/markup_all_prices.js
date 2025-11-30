#!/usr/bin/env node
/**
 * Apply a global markup to every product variant price in Saleor.
 *
 * Usage:
 *   PRICE_MARKUP=0.15 node scripts/markup_all_prices.js
 *
 * Environment variables that must be set:
 *   NEXT_PUBLIC_SALEOR_API_URL – Saleor GraphQL endpoint
 *   SALEOR_APP_TOKEN          – App token with MANAGE_PRODUCTS
 *
 * Optional:
 *   PRICE_MARKUP              – percentage expressed as decimal (0.15 = 15%)
 *   MARKUP_BATCH_SIZE         – number of variants fetched per request (default 100)
 */

const DEFAULT_MARKUP = 0.15;
const DEFAULT_BATCH_SIZE = 100;
const MAX_RETRIES = 5;

const API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const APP_TOKEN = process.env.SALEOR_APP_TOKEN;
const MARKUP = parseFloat(process.env.PRICE_MARKUP ?? `${DEFAULT_MARKUP}`);
const BATCH_SIZE = parseInt(
  process.env.MARKUP_BATCH_SIZE ?? `${DEFAULT_BATCH_SIZE}`,
  10,
);

if (!API_URL || !APP_TOKEN) {
  throw new Error(
    "NEXT_PUBLIC_SALEOR_API_URL и SALEOR_APP_TOKEN должны быть заданы в переменных окружения.",
  );
}

if (Number.isNaN(MARKUP) || MARKUP <= 0) {
  throw new Error(
    `Неверное значение PRICE_MARKUP. Ожидалось положительное число, получено "${process.env.PRICE_MARKUP}".`,
  );
}

if (Number.isNaN(BATCH_SIZE) || BATCH_SIZE <= 0) {
  throw new Error(
    `Неверное значение MARKUP_BATCH_SIZE. Ожидалось положительное число, получено "${process.env.MARKUP_BATCH_SIZE}".`,
  );
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function graphqlRequest(query, variables = {}, attempt = 0) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${APP_TOKEN}`,
  };

  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });
  } catch (networkError) {
    if (attempt >= MAX_RETRIES) {
      throw networkError;
    }
    const waitMs = 2000 * (attempt + 1);
    console.warn(
      `Ошибка сети при запросе (попытка ${attempt + 1}/${MAX_RETRIES}). Ждем ${waitMs} мс…`,
      networkError,
    );
    await delay(waitMs);
    return graphqlRequest(query, variables, attempt + 1);
  }

  let json;
  try {
    json = await response.json();
  } catch (parseError) {
    throw new Error(
      `Не удалось разобрать ответ Saleor (${response.status}): ${parseError.message}`,
    );
  }

  if (json?.type === "Too Many Requests") {
    if (attempt >= MAX_RETRIES) {
      throw new Error(
        `Превышен лимит запросов Saleor: ${JSON.stringify(json, null, 2)}`,
      );
    }

    const waitMs = 2000 * (attempt + 1);
    console.warn(
      `Получен ответ о лимите запросов. Повторяем через ${waitMs} мс (попытка ${attempt + 1}/${MAX_RETRIES})…`,
    );
    await delay(waitMs);
    return graphqlRequest(query, variables, attempt + 1);
  }

  if (json.errors?.length) {
    throw new Error(
      json.errors.map((error) => error.message || "GraphQL error").join("\n"),
    );
  }

  if (typeof json.data === "undefined") {
    throw new Error(
      `Пустой ответ от GraphQL: ${JSON.stringify(json, null, 2)}`,
    );
  }

  return json.data;
}

async function* iterateVariants() {
  const query = /* GraphQL */ `
    query ProductVariants($first: Int!, $after: String) {
      productVariants(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            name
            sku
            product {
              name
            }
            channelListings {
              id
              price {
                amount
                currency
              }
              channel {
                id
                slug
                name
              }
            }
          }
        }
      }
    }
  `;

  let hasNextPage = true;
  let after = null;

  while (hasNextPage) {
    const data = await graphqlRequest(query, {
      first: BATCH_SIZE,
      after,
    });

    const connection = data?.productVariants;
    if (!connection) {
      throw new Error("Не удалось получить список вариаций товаров.");
    }

    for (const edge of connection.edges) {
      if (edge?.node) {
        yield edge.node;
      }
    }

    hasNextPage = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
  }
}

function roundPrice(amount) {
  return Number((amount * (1 + MARKUP)).toFixed(2));
}

async function updateVariantChannels(variantId, updates) {
  if (!updates.length) {
    return;
  }

  const mutation = /* GraphQL */ `
    mutation VariantChannelListingUpdate(
      $id: ID!
      $input: [ProductVariantChannelListingAddInput!]!
    ) {
      productVariantChannelListingUpdate(id: $id, input: $input) {
        errors {
          field
          message
          code
        }
        variant {
          id
        }
      }
    }
  `;

  const variables = {
    id: variantId,
    input: updates,
  };

  const data = await graphqlRequest(mutation, variables);
  const errors = data?.productVariantChannelListingUpdate?.errors ?? [];

  if (errors.length) {
    const message = errors
      .map(
        (err) =>
          `${err.code}${err.field ? ` (${err.field})` : ""}: ${err.message}`,
      )
      .join("; ");
    throw new Error(
      `Не удалось обновить цены вариации ${variantId}: ${message}`,
    );
  }
}

async function main() {
  console.log(
    `Начинаем обновление цен: наценка ${(MARKUP * 100).toFixed(2)}%, размер батча ${BATCH_SIZE}.`,
  );

  let updatedChannelCount = 0;
  let variantCount = 0;

  for await (const variant of iterateVariants()) {
    variantCount += 1;
    const variantName = variant.name || variant.product?.name || variant.id;

    const updates = [];
    for (const listing of variant.channelListings ?? []) {
      if (!listing?.price?.amount || !listing?.id) {
        continue;
      }

      const newAmount = roundPrice(listing.price.amount);

      const channelId = listing.channel?.id;
      if (!channelId) {
        console.warn(
          `Пропускаем канал без ID для вариации ${variant.id} (${listing?.channel?.slug ?? "unknown"}).`,
        );
        continue;
      }

      updates.push({
        channelId,
        price: newAmount,
      });
    }

    if (!updates.length) {
      console.log(
        `Пропускаем вариацию "${variantName}" (${variant.id}) — нет каналов с установленной ценой.`,
      );
      continue;
    }

    try {
      await updateVariantChannels(variant.id, updates);
      updatedChannelCount += updates.length;
      console.log(
        `Обновили ${updates.length} канал(ов) для вариации "${variantName}" (${variant.id}).`,
      );
    } catch (error) {
      console.error(
        `Ошибка при обновлении вариации "${variantName}" (${variant.id}):`,
        error,
      );
    }
  }

  console.log(
    `Готово! Обработано вариаций: ${variantCount}. Обновлено каналов: ${updatedChannelCount}.`,
  );
}

main().catch((error) => {
  console.error("Критическая ошибка при выполнении скрипта:", error);
  process.exitCode = 1;
});
