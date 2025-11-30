const API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const APP_TOKEN = process.env.SALEOR_APP_TOKEN;

if (!API_URL || !APP_TOKEN) {
  throw new Error(
    "NEXT_PUBLIC_SALEOR_API_URL и SALEOR_APP_TOKEN должны быть заданы в переменных окружения.",
  );
}

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

// Получить все продукты с автоматически добавленными изображениями
async function fetchProductsWithAutoImages() {
  const products = [];
  let hasNextPage = true;
  let after = null;

  const query = /* GraphQL */ `
    query ProductsWithAutoImages($after: String) {
      products(first: 50, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            name
            media {
              id
              url
            }
            metadata {
              key
              value
            }
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
      const product = edge.node;
      // Ищем продукты с metadata autoImage: true и изображениями
      const hasAutoImage = product.metadata?.some(
        (meta) => meta.key === "autoImage" && meta.value === "true",
      );

      if (hasAutoImage && product.media && product.media.length > 0) {
        products.push(product);
      }
    }

    hasNextPage = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
    await delay(500);
  }

  return products;
}

// Удалить изображение продукта
async function deleteProductImage(productId, mediaId) {
  const mutation = /* GraphQL */ `
    mutation ProductMediaDelete($id: ID!) {
      productMediaDelete(id: $id) {
        product {
          id
        }
        errors {
          field
          message
          code
        }
      }
    }
  `;

  try {
    const data = await graphqlRequest(mutation, { id: mediaId });

    if (
      data.productMediaDelete?.errors &&
      data.productMediaDelete.errors.length > 0
    ) {
      throw new Error(
        `Ошибки при удалении изображения: ${JSON.stringify(
          data.productMediaDelete.errors,
        )}`,
      );
    }

    return true;
  } catch (error) {
    console.error(
      `Ошибка при удалении изображения ${mediaId} продукта ${productId}:`,
      error.message,
    );
    throw error;
  }
}

// Удалить метаданные autoImage
async function removeAutoImageMetadata(productId) {
  const mutation = /* GraphQL */ `
    mutation DeleteProductMetadata($id: ID!, $keys: [String!]!) {
      deleteMetadata(id: $id, keys: $keys) {
        item {
          ... on Product {
            id
          }
        }
        errors {
          field
          message
        }
      }
    }
  `;

  try {
    const data = await graphqlRequest(mutation, {
      id: productId,
      keys: ["autoImage"],
    });

    if (data.deleteMetadata?.errors && data.deleteMetadata.errors.length > 0) {
      console.warn(
        `Предупреждение при удалении метаданных ${productId}:`,
        data.deleteMetadata.errors,
      );
    }

    return true;
  } catch (error) {
    console.error(
      `Ошибка при удалении метаданных продукта ${productId}:`,
      error.message,
    );
    // Не прерываем выполнение
  }
}

// Основная функция
async function main() {
  console.log(
    "🧹 Начинаем удаление автоматически добавленных изображений...\n",
  );

  // Получаем продукты с автоматически добавленными изображениями
  console.log("📦 Получаем список продуктов с автоматическими фото...");
  const productsWithAutoImages = await fetchProductsWithAutoImages();

  console.log(
    `\n✅ Найдено ${productsWithAutoImages.length} продуктов с автоматическими фото\n`,
  );

  if (productsWithAutoImages.length === 0) {
    console.log("✨ Нет продуктов с автоматическими фото для удаления!");
    return;
  }

  let successCount = 0;
  let failCount = 0;
  let totalImagesDeleted = 0;

  // Обрабатываем каждый продукт
  for (let i = 0; i < productsWithAutoImages.length; i++) {
    const product = productsWithAutoImages[i];
    const progress = `[${i + 1}/${productsWithAutoImages.length}]`;

    try {
      console.log(`${progress} Обработка: ${product.name}`);
      console.log(`  📸 Найдено изображений: ${product.media.length}`);

      // Удаляем все изображения
      for (const media of product.media) {
        console.log(`  🗑️  Удаление изображения ${media.id}...`);
        await deleteProductImage(product.id, media.id);
        totalImagesDeleted++;
        await delay(500);
      }

      // Удаляем метаданные autoImage
      console.log(`  🏷️  Удаление метаданных autoImage...`);
      await removeAutoImageMetadata(product.id);
      await delay(500);

      console.log(`  ✅ Успешно!\n`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Ошибка: ${error.message}\n`);
      failCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`\n📊 Результаты:`);
  console.log(`   ✅ Успешно обработано продуктов: ${successCount}`);
  console.log(`   🗑️  Всего удалено изображений: ${totalImagesDeleted}`);
  console.log(`   ❌ Ошибок: ${failCount}`);
  console.log(`   📦 Всего продуктов: ${productsWithAutoImages.length}`);
  console.log("\n✨ Готово!\n");
}

// Запуск скрипта
main().catch((error) => {
  console.error("\n❌ Критическая ошибка:", error);
  process.exit(1);
});
