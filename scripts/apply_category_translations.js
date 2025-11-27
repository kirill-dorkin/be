const fs = require("fs");
const path = require("path");

const API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const APP_TOKEN = process.env.SALEOR_APP_TOKEN;

if (!API_URL || !APP_TOKEN) {
  throw new Error("Не заданы NEXT_PUBLIC_SALEOR_API_URL или SALEOR_APP_TOKEN");
}

const CATALOG = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "catalog_curated.json"), "utf8")
);

const LOCALE_TO_ENUM = {
  "en-GB": "EN_GB",
  "ru-RU": "RU",
  "ky-KG": "KY",
};

async function graphqlRequest(query, variables = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${APP_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  let json;
  try {
    json = await res.json();
  } catch (error) {
    const text = await res.text();
    throw new Error(`Invalid JSON response: ${text}`);
  }
  if (json.errors) {
    throw new Error(
      json.errors
        .map((e) => `${e.message}${e.extensions ? ` (${JSON.stringify(e.extensions)})` : ""}`)
        .join("\n")
    );
  }
  return json.data;
}

async function loadCategoryIds() {
  const slugToId = new Map();
  let hasNextPage = true;
  let after = null;

  const query = /* GraphQL */ `
    query AllCategories($after: String) {
      categories(first: 100, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            slug
          }
        }
      }
    }
  `;

  while (hasNextPage) {
    const data = await graphqlRequest(query, { after });
    const { edges, pageInfo } = data.categories;
    for (const edge of edges) {
      slugToId.set(edge.node.slug, edge.node.id);
    }
    hasNextPage = pageInfo.hasNextPage;
    after = pageInfo.endCursor;
  }

  return slugToId;
}

function collectCategoryTranslations() {
  const map = new Map();
  const stack = [...CATALOG.categories];

  while (stack.length) {
    const node = stack.pop();
    map.set(node.slug, node.translations || {});
    if (node.subcategories) {
      stack.push(...node.subcategories);
    }
  }
  return map;
}

async function applyTranslations(slugToId, translationsMap) {
  const mutation = /* GraphQL */ `
    mutation TranslateCategory(
      $id: ID!
      $language: LanguageCodeEnum!
      $input: TranslationInput!
    ) {
      categoryTranslate(id: $id, languageCode: $language, input: $input) {
        errors {
          field
          message
        }
      }
    }
  `;

  for (const [slug, locales] of translationsMap.entries()) {
    const categoryId = slugToId.get(slug);
    if (!categoryId) {
      console.warn(`Категория со слагом "${slug}" не найдена в Saleor.`);
      continue;
    }
    for (const [locale, payload] of Object.entries(locales)) {
      const languageCode = LOCALE_TO_ENUM[locale];
      if (!languageCode) {
        continue;
      }
      const input = {
        name: payload.name,
      };
      console.log(`Перевод: ${slug} -> ${languageCode}`);
      const result = await graphqlRequest(mutation, {
        id: categoryId,
        language: languageCode,
        input,
      });
      const errors = result.categoryTranslate.errors || [];
      if (errors.length) {
        throw new Error(
          `Ошибка перевода категории ${slug} (${languageCode}): ${JSON.stringify(
            errors
          )}`
        );
      }
    }
  }
}

async function main() {
  console.log("Загружаем идентификаторы категорий…");
  const slugToId = await loadCategoryIds();
  console.log(`Получено ${slugToId.size} категорий из Saleor.`);

  console.log("Собираем переводы из catalog_curated.json…");
  const translationsMap = collectCategoryTranslations();

  console.log("Применяем переводы…");
  await applyTranslations(slugToId, translationsMap);

  console.log("Готово: переводы категорий обновлены.");
}

main().catch((error) => {
  console.error("Скрипт завершился с ошибкой:");
  console.error(error);
  process.exit(1);
});
