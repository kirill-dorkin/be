const fs = require("fs");
const path = require("path");

const API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const APP_TOKEN = process.env.SALEOR_APP_TOKEN;

if (!API_URL || !APP_TOKEN) {
  throw new Error(
    "Требуются переменные окружения NEXT_PUBLIC_SALEOR_API_URL и SALEOR_APP_TOKEN",
  );
}

const CATALOG_PATH = path.join(__dirname, "..", "catalog_curated.json");
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

const slugMapping = new Map(); // oldSlug -> newSlug
const usedSlugs = new Set();

function slugify(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function ensureUniqueSlug(base) {
  let candidate = base || "category";
  let suffix = 2;
  while (usedSlugs.has(candidate)) {
    candidate = `${base}-${suffix++}`;
  }
  usedSlugs.add(candidate);
  return candidate;
}

function updateCategoryNode(node, parentName) {
  const oldSlug = node.slug;
  const englishName =
    node.translations?.["en-GB"]?.name ||
    node.translations?.["en"]?.name ||
    node.name ||
    "";
  let baseSlug = slugify(englishName);

  if (!baseSlug && parentName) {
    baseSlug = slugify(`${parentName}-${oldSlug}`);
  }
  if (!baseSlug) {
    baseSlug = slugify(oldSlug);
  }

  const newSlug = ensureUniqueSlug(baseSlug);

  slugMapping.set(oldSlug, newSlug);
  node.slug = newSlug;

  if (Array.isArray(node.subcategories)) {
    for (const child of node.subcategories) {
      updateCategoryNode(child, englishName);
    }
  }
}

for (const root of catalog.categories) {
  updateCategoryNode(root, null);
}

catalog.metadata.root_categories = catalog.categories.map((cat) => ({
  slug: cat.slug,
  translations: cat.translations,
}));

fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
console.log(
  `Обновлены slugs в catalog_curated.json. Всего категорий: ${slugMapping.size}`,
);

async function graphqlRequest(query, variables = {}) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${APP_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join("\n"));
  }
  return json.data;
}

async function loadCategoryIds() {
  const map = new Map();
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
    const connection = data.categories;
    for (const edge of connection.edges) {
      map.set(edge.node.slug, edge.node.id);
    }
    hasNextPage = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
  }

  return map;
}

async function updateSlugs() {
  const slugToId = await loadCategoryIds();
  const mutation = /* GraphQL */ `
    mutation CategorySlugUpdate($id: ID!, $input: CategoryInput!) {
      categoryUpdate(id: $id, input: $input) {
        category {
          id
          slug
        }
        errors {
          message
        }
      }
    }
  `;

  for (const [oldSlug, newSlug] of slugMapping.entries()) {
    if (oldSlug === newSlug) {
      continue;
    }
    const id = slugToId.get(oldSlug);
    if (!id) {
      console.warn(`Категория со слагом "${oldSlug}" не найдена в Saleor.`);
      continue;
    }
    const result = await graphqlRequest(mutation, {
      id,
      input: { slug: newSlug },
    });
    const errors = result.categoryUpdate.errors || [];
    if (errors.length) {
      throw new Error(
        `Ошибка обновления категории ${oldSlug}: ${errors
          .map((e) => e.message)
          .join(", ")}`,
      );
    }
    console.log(`Категория "${oldSlug}" → "${newSlug}" обновлена.`);
  }
}

updateSlugs()
  .then(() => {
    console.log("Обновление slugs в Saleor завершено.");
  })
  .catch((error) => {
    console.error("Скрипт завершился с ошибкой:");
    console.error(error);
    process.exit(1);
  });
