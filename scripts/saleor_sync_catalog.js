const fs = require("fs");
const path = require("path");

const API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const APP_TOKEN = process.env.SALEOR_APP_TOKEN;
const CHANNEL_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_CHANNEL || "default-channel";

if (!API_URL || !APP_TOKEN) {
  throw new Error(
    "NEXT_PUBLIC_SALEOR_API_URL и SALEOR_APP_TOKEN должны быть заданы в переменных окружения.",
  );
}

const CATALOG_FILE = path.join(__dirname, "..", "catalog_curated.json");

if (!fs.existsSync(CATALOG_FILE)) {
  throw new Error(
    "Файл catalog_curated.json не найден. Сначала выполните scripts/build_curated_catalog.js.",
  );
}

const catalogData = JSON.parse(fs.readFileSync(CATALOG_FILE, "utf-8"));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function graphqlRequest(query, variables = {}, attempt = 0) {
  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${APP_TOKEN}`,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (networkError) {
    if (attempt >= 5) {
      throw networkError;
    }
    const waitMs = 2000 * (attempt + 1);
    console.warn(
      `Ошибка сети при запросе к Saleor (попытка ${attempt + 1}). Ждем ${waitMs} мс`,
    );
    await delay(waitMs);
    return graphqlRequest(query, variables, attempt + 1);
  }

  const json = await response.json();

  if (json?.type === "Too Many Requests") {
    if (attempt >= 5) {
      throw new Error(
        `Saleor API ограничил запросы после нескольких попыток: ${JSON.stringify(
          json,
        )}`,
      );
    }
    const waitMs = 2000 * (attempt + 1);
    console.warn(
      `Получен ответ о лимите запросов. Ожидаем ${waitMs} мс перед повтором…`,
    );
    await delay(waitMs);
    return graphqlRequest(query, variables, attempt + 1);
  }

  if (json.errors) {
    const message = json.errors
      .map((error) => error.message || "GraphQL error")
      .join("\n");
    throw new Error(message);
  }

  if (typeof json.data === "undefined") {
    throw new Error(
      `Пустой ответ от GraphQL: ${JSON.stringify(json, null, 2)}`,
    );
  }

  return json.data;
}

function chunk(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

async function fetchAllProductIds() {
  const ids = [];
  let hasNextPage = true;
  let after = null;

  const query = /* GraphQL */ `
    query Products($after: String) {
      products(first: 100, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  while (hasNextPage) {
    const data = await graphqlRequest(query, { after });
    const connection = data?.products;
    if (!connection) {
      console.error("Неожиданный ответ при запросе продуктов:", data);
      throw new Error("Не удалось получить список продуктов из Saleor");
    }
    for (const edge of connection.edges) {
      ids.push(edge.node.id);
    }
    hasNextPage = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
  }

  return ids;
}

async function fetchRootCategoryIds() {
  const ids = [];
  let hasNextPage = true;
  let after = null;

  const query = /* GraphQL */ `
    query RootCategories($after: String) {
      categories(first: 100, after: $after, level: 0) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  while (hasNextPage) {
    const data = await graphqlRequest(query, { after });
    const connection = data.categories;
    for (const edge of connection.edges) {
      ids.push(edge.node.id);
    }
    hasNextPage = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
  }

  return ids;
}

async function fetchAllProductTypeIds() {
  const ids = [];
  let hasNextPage = true;
  let after = null;

  const query = /* GraphQL */ `
    query ProductTypes($after: String) {
      productTypes(first: 100, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  while (hasNextPage) {
    const data = await graphqlRequest(query, { after });
    const connection = data.productTypes;
    for (const edge of connection.edges) {
      ids.push(edge.node.id);
    }
    hasNextPage = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
  }

  return ids;
}

async function bulkDeleteProducts(ids) {
  if (!ids.length) {
    return;
  }

  const mutation = /* GraphQL */ `
    mutation ProductBulkDelete($ids: [ID!]!) {
      productBulkDelete(ids: $ids) {
        count
        errors {
          message
        }
      }
    }
  `;

  for (const group of chunk(ids, 50)) {
    const response = await graphqlRequest(mutation, { ids: group });
    const result = response.productBulkDelete;
    if (result.errors?.length) {
      throw new Error(
        `Ошибка удаления продуктов: ${result.errors
          .map((e) => e.message)
          .join(", ")}`,
      );
    }
    console.log(`Удалено продуктов: ${result?.count ?? group.length}`);
  }
}

async function bulkDeleteCategories(ids) {
  if (!ids.length) {
    return;
  }

  const mutation = /* GraphQL */ `
    mutation CategoryBulkDelete($ids: [ID!]!) {
      categoryBulkDelete(ids: $ids) {
        count
        errors {
          message
        }
      }
    }
  `;

  for (const group of chunk(ids, 50)) {
    let response;
    try {
      response = await graphqlRequest(mutation, { ids: group });
    } catch (error) {
      if (error.message.includes("There is no node of type Category")) {
        console.warn(
          "Часть категорий уже отсутствует, пропускаем текущий пакет.",
        );
        continue;
      }
      throw error;
    }
    const result = response.categoryBulkDelete;
    const errors =
      result.errors?.filter(
        (error) =>
          !error.message?.includes("There is no node of type Category"),
      ) || [];
    if (errors.length) {
      throw new Error(
        `Ошибка удаления категорий: ${errors.map((e) => e.message).join(", ")}`,
      );
    }
    console.log(
      `Удалено категорий: ${result?.count ?? 0}${
        result.errors?.length ? " (часть уже удалена)" : ""
      }`,
    );
  }
}

async function bulkDeleteProductTypes(ids) {
  if (!ids.length) {
    return;
  }

  const mutation = /* GraphQL */ `
    mutation ProductTypeBulkDelete($ids: [ID!]!) {
      productTypeBulkDelete(ids: $ids) {
        count
        errors {
          message
        }
      }
    }
  `;

  for (const group of chunk(ids, 50)) {
    const response = await graphqlRequest(mutation, { ids: group });
    const result = response.productTypeBulkDelete;
    if (result.errors?.length) {
      throw new Error(
        `Ошибка удаления типов продуктов: ${result.errors
          .map((e) => e.message)
          .join(", ")}`,
      );
    }
    console.log(`Удалено типов продуктов: ${result?.count ?? group.length}`);
  }
}

async function fetchChannelId(slug) {
  const query = /* GraphQL */ `
    query Channel($slug: String!) {
      channel(slug: $slug) {
        id
        name
        currencyCode
        isActive
      }
    }
  `;

  const data = await graphqlRequest(query, { slug });
  if (!data?.channel?.id) {
    throw new Error(`Канал со слагом "${slug}" не найден.`);
  }
  return data.channel;
}

async function ensureProductType() {
  const existing = await graphqlRequest(/* GraphQL */ `
    query ExistingProductTypes {
      productTypes(first: 50) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `);

  const found =
    existing.productTypes?.edges?.find(
      (edge) => edge.node.name === "Электроника и аксессуары",
    ) || existing.productTypes?.edges?.[0];

  if (found) {
    return found.node.id;
  }

  const mutation = /* GraphQL */ `
    mutation ProductTypeCreate($input: ProductTypeInput!) {
      productTypeCreate(input: $input) {
        productType {
          id
          name
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const input = {
    name: "Электроника и аксессуары",
    slug: `electronika-${Date.now()}`,
    hasVariants: true,
    isShippingRequired: true,
    isDigital: false,
    kind: "NORMAL",
    productAttributes: [],
    variantAttributes: [],
  };

  const response = await graphqlRequest(mutation, { input });
  const result = response.productTypeCreate;
  if (result.errors?.length) {
    throw new Error(
      `Не удалось создать тип продукта: ${result.errors
        .map((e) => e.message)
        .join(", ")}`,
    );
  }

  return result.productType.id;
}

async function createCategory(node, parentId, pathStack, map) {
  const lookup = await graphqlRequest(
    /* GraphQL */ `
      query CategoryBySlug($slug: String!) {
        category(slug: $slug) {
          id
        }
      }
    `,
    { slug: node.slug },
  );

  if (lookup?.category?.id) {
    const categoryId = lookup.category.id;
    const currentPath = [...pathStack, node.name];
    map.set(currentPath.join(" > "), categoryId);
    if (Array.isArray(node.subcategories)) {
      for (const child of node.subcategories) {
        await createCategory(child, categoryId, currentPath, map);
      }
    }
    return;
  }

  const mutation = /* GraphQL */ `
    mutation CategoryCreate($input: CategoryInput!, $parent: ID) {
      categoryCreate(input: $input, parent: $parent) {
        category {
          id
          name
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const input = {
    name: node.name,
    slug: node.slug,
  };

  const variables = { input };
  if (parentId) {
    variables.parent = parentId;
  }

  const response = await graphqlRequest(mutation, variables);
  const result = response.categoryCreate;
  if (result.errors?.length) {
    throw new Error(
      `Не удалось создать категорию "${node.name}": ${result.errors
        .map((e) => e.message)
        .join(", ")}`,
    );
  }

  const categoryId = result.category.id;
  const currentPath = [...pathStack, node.name];
  map.set(currentPath.join(" > "), categoryId);

  if (Array.isArray(node.subcategories)) {
    for (const child of node.subcategories) {
      await createCategory(child, categoryId, currentPath, map);
    }
  }
}

async function buildCategoriesMap(categories) {
  const map = new Map();
  for (const root of categories) {
    await createCategory(root, null, [], map);
  }
  return map;
}

function collectProductsFromCatalog(categories) {
  const items = [];

  const traverse = (node) => {
    if (Array.isArray(node.products)) {
      for (const product of node.products) {
        items.push(product);
      }
    }
    if (Array.isArray(node.subcategories)) {
      for (const child of node.subcategories) {
        traverse(child);
      }
    }
  };

  for (const root of categories) {
    traverse(root);
  }

  return items;
}

function toMetadataArray(product) {
  const metadata = [
    {
      key: "unit",
      value: String(product.unit || ""),
    },
    {
      key: "category_path",
      value: product.category_path.join(" > "),
    },
  ];

  if (product.comment) {
    metadata.push({
      key: "comment",
      value: String(product.comment),
    });
  }

  return metadata;
}

async function createProductRecord({
  product,
  productTypeId,
  categoryId,
  channelId,
}) {
  const existingVariant = await graphqlRequest(
    /* GraphQL */ `
      query VariantBySku($sku: String!) {
        productVariant(sku: $sku) {
          id
        }
      }
    `,
    { sku: product.sku },
  );

  if (existingVariant?.productVariant?.id) {
    return;
  }

  const productCreate = /* GraphQL */ `
    mutation ProductCreate($input: ProductCreateInput!) {
      productCreate(input: $input) {
        product {
          id
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const productResponse = await graphqlRequest(productCreate, {
    input: {
      name: product.name,
      slug: product.slug,
      productType: productTypeId,
      category: categoryId,
      metadata: toMetadataArray(product),
    },
  });

  if (!productResponse) {
    throw new Error(
      `Пустой ответ productCreate для "${product.name}" (SKU ${product.sku})`,
    );
  }

  const productResult = productResponse.productCreate;

  if (!productResult) {
    throw new Error(
      `Нет данных productCreate для "${product.name}" (SKU ${product.sku})`,
    );
  }

  if (productResult.errors?.length) {
    throw new Error(
      `Ошибка создания продукта "${product.name}": ${productResult.errors
        .map((e) => e.message)
        .join(", ")}`,
    );
  }

  const productId = productResult.product.id;

  const variantCreate = /* GraphQL */ `
    mutation ProductVariantCreate($input: ProductVariantCreateInput!) {
      productVariantCreate(input: $input) {
        productVariant {
          id
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const variantResponse = await graphqlRequest(variantCreate, {
    input: {
      product: productId,
      sku: product.sku,
      name: product.name,
      trackInventory: false,
      attributes: [],
      metadata: toMetadataArray(product),
    },
  });

  if (!variantResponse) {
    throw new Error(
      `Пустой ответ productVariantCreate для "${product.name}" (SKU ${product.sku})`,
    );
  }

  const variantResult = variantResponse.productVariantCreate;

  if (!variantResult) {
    throw new Error(
      `Нет данных productVariantCreate для "${product.name}" (SKU ${product.sku})`,
    );
  }

  if (variantResult.errors?.length) {
    throw new Error(
      `Ошибка создания варианта "${product.name}": ${variantResult.errors
        .map((e) => e.message)
        .join(", ")}`,
    );
  }

  const variantId = variantResult.productVariant.id;

  const productChannelMutation = /* GraphQL */ `
    mutation ProductChannelListingUpdate(
      $id: ID!
      $input: ProductChannelListingUpdateInput!
    ) {
      productChannelListingUpdate(id: $id, input: $input) {
        errors {
          field
          message
        }
      }
    }
  `;

  const productChannelResponse = await graphqlRequest(productChannelMutation, {
    id: productId,
    input: {
      updateChannels: [
        {
          channelId,
          isPublished: true,
          visibleInListings: true,
          isAvailableForPurchase: true,
        },
      ],
    },
  });

  if (!productChannelResponse) {
    throw new Error(
      `Пустой ответ от productChannelListingUpdate для "${product.name}"`,
    );
  }

  const productChannelResult =
    productChannelResponse.productChannelListingUpdate;

  if (!productChannelResult) {
    throw new Error(
      `Нет данных в productChannelListingUpdate для "${product.name}"`,
    );
  }

  if (productChannelResult.errors?.length) {
    throw new Error(
      `Ошибка публикации продукта "${product.name}": ${productChannelResult.errors
        .map((e) => e.message)
        .join(", ")}`,
    );
  }

  const variantChannelMutation = /* GraphQL */ `
    mutation ProductVariantChannelListingUpdate(
      $id: ID!
      $input: [ProductVariantChannelListingAddInput!]!
    ) {
      productVariantChannelListingUpdate(id: $id, input: $input) {
        errors {
          field
          message
        }
      }
    }
  `;

  const priceAmount =
    typeof product.price?.amount === "number"
      ? product.price.amount.toString()
      : String(product.price?.amount ?? "0");

  const variantChannelResponse = await graphqlRequest(variantChannelMutation, {
    id: variantId,
    input: [
      {
        channelId,
        price: priceAmount,
        costPrice: priceAmount,
      },
    ],
  });

  const variantChannelResult =
    variantChannelResponse?.productVariantChannelListingUpdate;

  if (!variantChannelResult) {
    throw new Error(`Пустой ответ при назначении цены для "${product.name}"`);
  }

  if (variantChannelResult.errors?.length) {
    throw new Error(
      `Ошибка назначения цены для "${product.name}": ${variantChannelResult.errors
        .map((e) => e.message)
        .join(", ")}`,
    );
  }
}

async function importProducts({
  products,
  productTypeId,
  channelId,
  categoryMap,
}) {
  const total = products.length;
  let completed = 0;
  const concurrency = Number(process.env.IMPORT_CONCURRENCY || "1");
  const queue = [...products];

  async function worker(workerIndex) {
    while (queue.length) {
      const current = queue.shift();
      if (!current) {
        break;
      }
      const categoryKey = current.category_path.join(" > ");
      const categoryId = categoryMap.get(categoryKey);
      if (!categoryId) {
        throw new Error(
          `Не найдена категория для пути "${categoryKey}" (SKU ${current.sku})`,
        );
      }
      try {
        await createProductRecord({
          product: current,
          productTypeId,
          categoryId,
          channelId,
        });
      } catch (error) {
        console.error(`Ошибка для SKU ${current.sku}: ${error.message}`);
        throw error;
      }
      completed += 1;
      if (process.env.IMPORT_DELAY_MS) {
        const wait = Number(process.env.IMPORT_DELAY_MS);
        if (wait > 0) {
          await delay(wait);
        }
      }
      if (completed % 25 === 0 || completed === total) {
        console.log(
          `[${completed}/${total}] Импортировано (worker ${workerIndex})`,
        );
      }
    }
  }

  const workers = Array.from({ length: concurrency }, (_, index) =>
    worker(index + 1),
  );

  await Promise.all(workers);
}
async function main() {
  console.log("Старт синхронизации Saleor.");
  console.log("API:", API_URL);
  console.log("Канал:", CHANNEL_SLUG);

  const skipReset = process.env.SKIP_RESET === "true";

  if (!skipReset) {
    console.log("Шаг 1. Очистка существующих данных…");
    const productIds = await fetchAllProductIds();
    if (productIds.length) {
      console.log(`Удаляем ${productIds.length} продуктов…`);
      await bulkDeleteProducts(productIds);
    } else {
      console.log("Продукты отсутствуют.");
    }

    let categoryPass = 0;
    let categoryIds = await fetchRootCategoryIds();
    while (categoryIds.length) {
      categoryPass += 1;
      console.log(
        `Удаляем ${categoryIds.length} корневых категорий… (итерация ${categoryPass})`,
      );
      await bulkDeleteCategories(categoryIds);
      categoryIds = await fetchRootCategoryIds();
    }
    if (!categoryPass) {
      console.log("Категории отсутствуют.");
    }

    let productTypePass = 0;
    let productTypeIds = await fetchAllProductTypeIds();
    while (productTypeIds.length) {
      productTypePass += 1;
      console.log(
        `Удаляем ${productTypeIds.length} типов продуктов… (итерация ${productTypePass})`,
      );
      await bulkDeleteProductTypes(productTypeIds);
      productTypeIds = await fetchAllProductTypeIds();
    }
    if (!productTypePass) {
      console.log("Типы продуктов отсутствуют.");
    }
  } else {
    console.log("Шаг 1 пропущен (SKIP_RESET=true).");
  }

  console.log("Шаг 2. Подготовка инфраструктуры…");
  const channel = await fetchChannelId(CHANNEL_SLUG);
  console.log(
    `Канал найден: ${channel.name} (${channel.currencyCode}), активен: ${channel.isActive}`,
  );

  const productTypeId = await ensureProductType();
  console.log(`Создан тип продукта: ${productTypeId}`);

  console.log("Создаем дерево категорий…");
  const categoryMap = await buildCategoriesMap(catalogData.categories);
  console.log(`Создано категорий: ${categoryMap.size}`);

  console.log("Шаг 3. Импорт продуктов…");
  const allProducts = collectProductsFromCatalog(catalogData.categories);
  const offset = Number(process.env.IMPORT_OFFSET || "0");
  const limitEnv = process.env.IMPORT_LIMIT;
  const limit = limitEnv ? Number(limitEnv) : allProducts.length - offset;
  const end = Math.min(offset + limit, allProducts.length);
  const slice = allProducts.slice(offset, end);

  console.log(
    `Всего продуктов к импорту: ${allProducts.length}. Обрабатываем диапазон ${offset}–${end}.`,
  );

  await importProducts({
    products: slice,
    productTypeId,
    channelId: channel.id,
    categoryMap,
  });

  console.log("Импорт завершен успешно.");
}

main().catch((error) => {
  console.error("Синхронизация завершилась с ошибкой:");
  console.error(error);
  process.exit(1);
});
