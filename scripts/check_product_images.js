const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Загружаем переменные окружения из .env файла
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  });
  console.log("✅ Переменные окружения загружены из .env\n");
}

const API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const APP_TOKEN = process.env.SALEOR_APP_TOKEN;

if (!API_URL || !APP_TOKEN) {
  throw new Error(
    "NEXT_PUBLIC_SALEOR_API_URL и SALEOR_APP_TOKEN должны быть заданы в переменных окружения.",
  );
}

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
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }

  return json.data;
}

// Получить продукты с автоматически добавленными изображениями
async function fetchProductsWithAutoImages(limit = 5) {
  const query = /* GraphQL */ `
    query ProductsWithAutoImages($first: Int!) {
      products(
        first: $first
        filter: { metadata: { key: "autoImage", value: "true" } }
      ) {
        edges {
          node {
            id
            name
            media {
              id
              url
              alt
              type
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

  const data = await graphqlRequest(query, { first: limit });
  return data.products.edges.map((edge) => edge.node);
}

// Проверить доступность изображения
async function checkImageAccessibility(url) {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      validateStatus: (status) => status < 500, // Принимаем любой статус < 500
    });

    return {
      accessible: response.status === 200,
      status: response.status,
      contentType: response.headers["content-type"],
      contentLength: response.headers["content-length"],
    };
  } catch (error) {
    return {
      accessible: false,
      error: error.message,
    };
  }
}

// Основная функция
async function main() {
  console.log(
    "🔍 Проверка продуктов с автоматически добавленными изображениями...\n",
  );

  try {
    const products = await fetchProductsWithAutoImages(5);

    if (products.length === 0) {
      console.log("❌ Не найдено продуктов с метаданными autoImage=true");
      console.log("   Запустите сначала: IMAGES_LIMIT=1 pnpm images:add\n");
      return;
    }

    console.log(
      `✅ Найдено ${products.length} продуктов с автоматическими изображениями\n`,
    );
    console.log("=".repeat(80) + "\n");

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`[${i + 1}/${products.length}] ${product.name}`);
      console.log(`   ID продукта: ${product.id}`);

      if (!product.media || product.media.length === 0) {
        console.log(`   ❌ Изображений нет!\n`);
        continue;
      }

      console.log(`   📸 Изображений: ${product.media.length}`);

      for (let j = 0; j < product.media.length; j++) {
        const media = product.media[j];
        console.log(`\n   Изображение ${j + 1}:`);
        console.log(`      ID: ${media.id}`);
        console.log(`      Тип: ${media.type}`);
        console.log(`      URL: ${media.url}`);

        // Проверяем доступность
        if (media.url) {
          console.log(`      🔍 Проверяю доступность...`);
          const check = await checkImageAccessibility(media.url);

          if (check.accessible) {
            console.log(`      ✅ Изображение ДОСТУПНО!`);
            console.log(`         Status: ${check.status}`);
            console.log(`         Content-Type: ${check.contentType}`);
            console.log(
              `         Размер: ${(check.contentLength / 1024).toFixed(2)} KB`,
            );
          } else {
            console.log(`      ❌ Изображение НЕДОСТУПНО!`);
            console.log(`         Status: ${check.status || "Ошибка"}`);
            if (check.error) {
              console.log(`         Ошибка: ${check.error}`);
            }
          }
        }
      }

      console.log("\n" + "=".repeat(80) + "\n");
    }

    console.log("✨ Проверка завершена!\n");
  } catch (error) {
    console.error("\n❌ Ошибка:", error.message);
    process.exit(1);
  }
}

main();
