const fs = require("fs");
const path = require("path");
const os = require("os");
const FormData = require("form-data");
const axios = require("axios");
const puppeteer = require("puppeteer");
const chalk = require("chalk");
const ora = require("ora");
const cliProgress = require("cli-progress");
const boxen = require("boxen");
const stringWidth = require("string-width").default;

// Простое логирование в файл
const logFilePath = path.join(
  __dirname,
  `image-add-${new Date().toISOString().split("T")[0]}.log`,
);
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

function log(level, message, productName = null) {
  const timestamp = new Date().toISOString();
  const productInfo = productName ? ` [${productName.substring(0, 50)}]` : "";
  const logLine = `[${timestamp}] [${level}]${productInfo} ${message}\n`;
  logStream.write(logLine);
}

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
  // Не выводим сообщение здесь, выведем в начале main()
}

const API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const APP_TOKEN = process.env.SALEOR_APP_TOKEN;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Очистка имени файла от недопустимых символов
function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, "") // Удаляем недопустимые символы
    .replace(/\s+/g, "_") // Пробелы заменяем на underscore
    .replace(/_{2,}/g, "_") // Множественные underscore на один
    .replace(/^[._]+|[._]+$/g, "") // Удаляем точки/underscore в начале и конце
    .substring(0, 100); // Ограничиваем длину до 100 символов
}

// Форматирование времени
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}ч ${remainingMinutes}м ${remainingSeconds}с`;
  }
  if (minutes > 0) {
    return `${minutes}м ${remainingSeconds}с`;
  }
  return `${seconds}с`;
}

// Проверка наличия капчи на странице
async function detectCaptcha(page) {
  try {
    const currentUrl = page.url();

    // Главная проверка: страница /sorry от Google - это точно капча
    if (currentUrl.includes("/sorry")) {
      return true;
    }

    // Если не /sorry, проверяем наличие iframe reCAPTCHA (строгая проверка)
    const strictCaptchaSelectors = [
      'iframe[src*="recaptcha"]',
      'iframe[title*="reCAPTCHA"]',
    ];

    for (const selector of strictCaptchaSelectors) {
      const captchaElement = await page.$(selector);
      if (captchaElement) {
        return true;
      }
    }

    // Дополнительная проверка: если URL содержит "sorry" или "unusual traffic"
    if (currentUrl.includes("unusual") || currentUrl.includes("blocked")) {
      return true;
    }

    // НЕ проверяем текст страницы - слишком много ложных срабатываний
    return false;
  } catch (error) {
    return false;
  }
}

// Ожидание решения капчи пользователем
async function waitForCaptchaSolution(
  page,
  maxWaitMinutes = 10,
  progressBar = null,
) {
  // Останавливаем прогресс-бар если передан
  if (progressBar) {
    progressBar.stop();
  }

  console.log(`\n⚠️  Обнаружена капча! Требуется ручное решение`);
  console.log(`👉 Откройте Chrome и решите капчу вручную`);
  console.log(`⏰ Жду максимум ${maxWaitMinutes} минут\n`);

  const maxWaitMs = maxWaitMinutes * 60 * 1000;
  const checkInterval = 5000; // Проверяем каждые 5 секунд
  const messageInterval = 60000; // Сообщение раз в минуту
  let elapsedMs = 0;
  let lastMessageTime = 0;

  while (elapsedMs < maxWaitMs) {
    await delay(checkInterval);
    elapsedMs += checkInterval;

    const hasCaptcha = await detectCaptcha(page);

    if (!hasCaptcha) {
      console.log(`✅ Капча решена! Продолжаю работу...\n`);
      await delay(2000);
      return true;
    }

    // Показываем прогресс раз в минуту
    if (elapsedMs - lastMessageTime >= messageInterval) {
      const minutesElapsed = Math.floor(elapsedMs / 60000);
      console.log(`⏳ Прошло ${minutesElapsed} мин, жду решения...`);
      lastMessageTime = elapsedMs;
    }
  }

  throw new Error(`Капча не была решена за ${maxWaitMinutes} минут`);
}

/**
 * Обработать капчу - ожидаем ручное решение пользователем
 */
async function handleCaptcha(page, progressBar = null) {
  await waitForCaptchaSolution(page, 10, progressBar);
  return true;
}

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

// Получить все продукты без изображений
async function fetchProductsWithoutImages() {
  const products = [];
  let hasNextPage = true;
  let after = null;

  const query = /* GraphQL */ `
    query ProductsWithImages($after: String) {
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
      // Пропускаем товары, у которых уже есть изображения
      if (!product.media || product.media.length === 0) {
        products.push(product);
      }
    }

    hasNextPage = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
    await delay(500);
  }

  return products;
}

/**
 * Упростить название товара для поиска
 * Убирает лишние детали, оставляет основное
 */
function simplifyProductName(name) {
  return (
    name
      // Убираем содержимое в скобках
      .replace(/\([^)]*\)/g, "")
      // Убираем содержимое после запятой (обычно там характеристики)
      .replace(/,.*$/, "")
      // Убираем множественные пробелы
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Проверить релевантность изображения товару
 * Сравнивает alt/title изображения с названием товара
 */
function checkImageRelevance(imageAlt, productName) {
  if (!imageAlt) return false;

  // Приводим к нижнему регистру для сравнения
  const altLower = imageAlt.toLowerCase();
  const nameLower = productName.toLowerCase();

  // Разбиваем название товара на ключевые слова (минимум 3 символа)
  const keywords = nameLower
    .split(/[\s,\-_]+/)
    .filter((word) => word.length >= 3);

  // Считаем сколько ключевых слов присутствует в alt
  let matchCount = 0;
  for (const keyword of keywords) {
    if (altLower.includes(keyword)) {
      matchCount++;
    }
  }

  // Релевантно если хотя бы 40% ключевых слов совпадают
  const relevanceScore = matchCount / keywords.length;
  return relevanceScore >= 0.4;
}

/**
 * Извлечь изображения с главной страницы поиска (блок Images)
 */
async function extractImagesFromMainPage(page, productName) {
  try {
    // Ждем появления блока с изображениями
    await page.waitForSelector("div[data-lpage], div[jsname], img[data-src]", {
      timeout: 5000,
    });

    const images = await page.evaluate(() => {
      const results = [];

      // Способ 1: Ищем изображения в блоке Images на главной странице
      const imageBlocks = document.querySelectorAll('a[href*="imgurl="]');
      for (const block of imageBlocks) {
        const href = block.href;
        const match = href.match(/imgurl=([^&]+)/);
        if (match) {
          const img = block.querySelector("img");
          results.push({
            url: decodeURIComponent(match[1]),
            alt: img?.alt || img?.title || "",
          });
        }
      }

      // Способ 2: Ищем изображения в карточках товаров
      if (results.length === 0) {
        const productImages = document.querySelectorAll(
          "img[data-src], img[src]",
        );
        for (const img of productImages) {
          const src = img.dataset.src || img.src;
          if (
            src &&
            src.startsWith("http") &&
            !src.includes("google.com/images")
          ) {
            results.push({
              url: src,
              alt: img.alt || img.title || "",
            });
          }
        }
      }

      return results.slice(0, 10); // Первые 10 изображений
    });

    if (images.length > 0) {
      // Проверяем релевантность каждого изображения
      for (const image of images) {
        const isRelevant = checkImageRelevance(image.alt, productName);
        if (isRelevant) {
          return image.url;
        }
      }

      // Если не нашли релевантное, берем первое
      return images[0].url;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Поиск изображения с помощью Google Search
 * Fallback стратегия: пробуем несколько способов
 */
async function searchProductImage(productName, browser, progressBar = null) {
  let page;
  try {
    page = await browser.newPage();

    // Устанавливаем User-Agent чтобы Google не банил
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    // СТРАТЕГИЯ 1: Полное название на вкладке Images (главная стратегия)
    let imageUrl = await trySearchStrategy(
      page,
      productName,
      true,
      progressBar,
    );
    if (imageUrl) {
      if (page) await page.close();
      return imageUrl;
    }

    // СТРАТЕГИЯ 2: Упрощенное название на Images
    const simplifiedName = simplifyProductName(productName);
    if (simplifiedName !== productName) {
      imageUrl = await trySearchStrategy(
        page,
        simplifiedName,
        true,
        progressBar,
      );
      if (imageUrl) {
        if (page) await page.close();
        return imageUrl;
      }
    }

    // FALLBACK СТРАТЕГИЯ 3: Полное название на главной странице (если Images не дал результатов)
    imageUrl = await trySearchStrategy(page, productName, false, progressBar);
    if (imageUrl) {
      if (page) await page.close();
      return imageUrl;
    }

    // FALLBACK СТРАТЕГИЯ 4: Упрощенное название на главной странице
    if (simplifiedName !== productName) {
      imageUrl = await trySearchStrategy(
        page,
        simplifiedName,
        false,
        progressBar,
      );
      if (imageUrl) {
        if (page) await page.close();
        return imageUrl;
      }
    }

    // КРАЙНИЙ СЛУЧАЙ: Берем любое изображение
    imageUrl = await tryGetAnyImage(page, progressBar);
    if (imageUrl) {
      if (page) await page.close();
      return imageUrl;
    }

    // Если ничего не получилось - ошибка
    if (page) await page.close();
    throw new Error("Не удалось найти ни одного изображения для товара");
  } catch (error) {
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        // Игнорируем ошибки при закрытии
      }
    }
    throw error;
  }
}

/**
 * Попытка поиска изображения по стратегии
 * @param {Page} page - страница Puppeteer
 * @param {string} query - поисковый запрос
 * @param {boolean} useImagesTab - использовать вкладку Images
 * @param {Object} progressBar - прогресс-бар для остановки при капче
 */
async function trySearchStrategy(
  page,
  query,
  useImagesTab,
  progressBar = null,
) {
  try {
    // Открываем Google
    await page.goto("https://www.google.com", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Вводим запрос
    const searchBoxSelector = 'textarea[name="q"], input[name="q"]';
    await page.waitForSelector(searchBoxSelector, { timeout: 10000 });

    await page.click(searchBoxSelector, { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.type(searchBoxSelector, query, { delay: 50 });
    await page.keyboard.press("Enter");

    // Ждём результаты
    await delay(2000);

    if (!useImagesTab) {
      // Ищем на главной странице (вкладка All)
      return await extractImagesFromMainPage(page, query);
    } else {
      // Переходим на вкладку Images
      try {
        await page.waitForSelector('a[href*="tbm=isch"]', { timeout: 5000 });
        await page.click('a[href*="tbm=isch"]');
        await delay(2000);
      } catch (e) {
        // Прямой переход
        const searchQuery = encodeURIComponent(query);
        await page.goto(
          `https://www.google.com/search?q=${searchQuery}&tbm=isch`,
          {
            waitUntil: "networkidle2",
            timeout: 30000,
          },
        );
        await delay(2000);
      }

      // Извлекаем изображение из Images
      return await extractImageFromImagesTab(page, query, progressBar);
    }
  } catch (error) {
    return null;
  }
}

/**
 * Извлечь изображение с вкладки Images
 */
async function extractImageFromImagesTab(
  page,
  productName,
  progressBar = null,
) {
  try {
    // Ждем загрузки изображений
    try {
      await page.waitForSelector("div[data-ri], img[data-src], .ivg-i img", {
        timeout: 10000,
      });
    } catch (waitError) {
      return null;
    }

    // Кликаем на первое изображение
    const selectors = [
      'div[data-ri="0"] img',
      ".ivg-i img",
      "img[data-src]",
      "div.isv-r img",
    ];

    let imageClicked = false;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        imageClicked = true;
        break;
      } catch (e) {
        // Пробуем следующий
      }
    }

    if (!imageClicked) {
      return null;
    }

    // Ждём загрузки превью
    await delay(2000);

    // Извлекаем URL
    const imageUrl = await page.evaluate(() => {
      const previewImg = document.querySelector(
        "img.sFlh5c, img.iPVvYb, img.n3VNCb, img[data-iml]",
      );
      if (previewImg && previewImg.src && previewImg.src.startsWith("http")) {
        return previewImg.src;
      }

      const imgLink = document.querySelector(
        'a[href*="imgurl="], a[jsname="sTFXNd"]',
      );
      if (imgLink) {
        const href = imgLink.href;
        const match = href.match(/imgurl=([^&]+)/);
        if (match) return decodeURIComponent(match[1]);
      }

      const allImages = document.querySelectorAll("img");
      for (const img of allImages) {
        const src = img.src;
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        if (
          src &&
          width > 200 &&
          height > 200 &&
          !src.includes("logo") &&
          !src.includes("google.com/images") &&
          src.startsWith("http")
        ) {
          return src;
        }
      }
      return null;
    });

    return imageUrl;
  } catch (error) {
    return null;
  }
}

/**
 * Попытка взять любое изображение (крайний случай)
 */
async function tryGetAnyImage(page, progressBar = null) {
  try {
    const imageUrl = await page.evaluate(() => {
      const allImages = document.querySelectorAll("img");
      for (const img of allImages) {
        const src = img.src;
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // Берем любое изображение больше 100x100
        if (
          src &&
          width > 100 &&
          height > 100 &&
          !src.includes("logo") &&
          !src.includes("google.com/images/branding") &&
          src.startsWith("http")
        ) {
          return src;
        }
      }
      return null;
    });

    return imageUrl;
  } catch (error) {
    return null;
  }
}

// Скачать изображение
async function downloadImage(imageUrl, productName = null) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.google.com/",
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    // Определяем расширение файла по Content-Type
    const contentType = response.headers["content-type"] || "";
    let extension = "jpg";
    if (contentType.includes("png")) extension = "png";
    else if (contentType.includes("webp")) extension = "webp";
    else if (contentType.includes("gif")) extension = "gif";
    else if (contentType.includes("jpeg") || contentType.includes("jpg"))
      extension = "jpg";

    const buffer = Buffer.from(response.data);

    // Проверяем что скачали не пустой файл
    if (buffer.length < 1000) {
      throw new Error(
        `Файл слишком маленький (${buffer.length} байт), возможно это не изображение`,
      );
    }

    // Определяем имя файла
    let filename;
    if (productName) {
      const sanitized = sanitizeFilename(productName);
      filename = `${sanitized}.${extension}`;
    } else {
      filename = `product-${Date.now()}.${extension}`;
    }

    const tempFilePath = path.join(os.tmpdir(), filename);
    fs.writeFileSync(tempFilePath, buffer);

    return tempFilePath;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Не удалось скачать изображение: HTTP ${error.response.status} ${error.response.statusText}`,
      );
    }
    throw new Error(`Не удалось скачать изображение: ${error.message}`);
  }
}

// Добавить изображение к продукту через file upload
async function addProductImage(productId, imagePath) {
  const mutation = /* GraphQL */ `
    mutation ProductMediaCreate($productId: ID!, $image: Upload!) {
      productMediaCreate(
        input: { product: $productId, image: $image, alt: "" }
      ) {
        product {
          id
          name
        }
        media {
          id
          url
          alt
          type
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
    // Определяем Content-Type и имя файла по расширению
    const extension = path.extname(imagePath).toLowerCase();
    const contentTypeMap = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".bmp": "image/bmp",
    };

    const contentType = contentTypeMap[extension] || "image/jpeg";
    const filename = `product${extension}`;

    const form = new FormData();

    const operations = {
      query: mutation,
      variables: {
        productId,
        image: null,
      },
    };

    const map = {
      0: ["variables.image"],
    };

    form.append("operations", JSON.stringify(operations));
    form.append("map", JSON.stringify(map));
    form.append("0", fs.createReadStream(imagePath), {
      filename: filename,
      contentType: contentType,
    });

    const response = await axios.post(API_URL, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${APP_TOKEN}`,
      },
    });

    const json = response.data;

    if (json.errors) {
      throw new Error(json.errors.map((e) => e.message).join(", "));
    }

    if (
      json.data?.productMediaCreate?.errors &&
      json.data.productMediaCreate.errors.length > 0
    ) {
      throw new Error(
        `Ошибки при добавлении изображения: ${JSON.stringify(
          json.data.productMediaCreate.errors,
        )}`,
      );
    }

    const result = json.data?.productMediaCreate;
    return result?.product;
  } catch (error) {
    // Enhanced error messages for common issues
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Не удалось подключиться к Saleor API. Проверьте URL в .env",
      );
    } else if (error.code === "ETIMEDOUT" || error.code === "ENOTFOUND") {
      throw new Error(
        "Таймаут подключения к Saleor API. Проверьте интернет-соединение",
      );
    } else if (error.response?.status === 401) {
      throw new Error(
        "Неверный токен авторизации. Проверьте SALEOR_APP_TOKEN в .env",
      );
    } else if (error.response?.status === 403) {
      throw new Error("Доступ запрещен. Проверьте права токена Saleor");
    } else if (error.response?.status === 413) {
      throw new Error("Изображение слишком большое для загрузки");
    } else if (error.response?.status >= 500) {
      throw new Error(
        `Ошибка сервера Saleor (${error.response.status}). Попробуйте позже`,
      );
    }
    throw error;
  } finally {
    // Удаляем временный файл (если не установлен флаг KEEP_IMAGES)
    const keepImages = process.env.KEEP_IMAGES === "true";

    if (keepImages) {
      // Сохраняем файл в папку downloaded_images
      try {
        const downloadedDir = path.join(__dirname, "downloaded_images");
        if (!fs.existsSync(downloadedDir)) {
          fs.mkdirSync(downloadedDir, { recursive: true });
        }

        const filename = path.basename(imagePath);
        const savedPath = path.join(downloadedDir, filename);

        // Если файл уже существует, добавляем счетчик
        let finalPath = savedPath;
        let counter = 1;
        while (fs.existsSync(finalPath)) {
          const ext = path.extname(filename);
          const nameWithoutExt = path.basename(filename, ext);
          finalPath = path.join(
            downloadedDir,
            `${nameWithoutExt}_${counter}${ext}`,
          );
          counter++;
        }

        fs.copyFileSync(imagePath, finalPath);
        // Тихо сохраняем без вывода (не портит прогресс-бар)

        // Удаляем временный файл
        fs.unlinkSync(imagePath);
      } catch (saveError) {
        console.warn(
          `    ⚠️  Не удалось сохранить изображение: ${saveError.message}`,
        );
      }
    } else {
      // Удаляем временный файл
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (cleanupError) {
        console.warn(
          `Не удалось удалить временный файл ${imagePath}:`,
          cleanupError.message,
        );
      }
    }
  }
}

// Добавить метаданные к продукту
async function addProductMetadata(productId, key, value) {
  const mutation = /* GraphQL */ `
    mutation UpdateProductMetadata($id: ID!, $input: [MetadataInput!]!) {
      updateMetadata(id: $id, input: $input) {
        item {
          ... on Product {
            id
            metadata {
              key
              value
            }
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
      input: [{ key, value }],
    });

    if (data.updateMetadata?.errors && data.updateMetadata.errors.length > 0) {
      console.warn(
        `Предупреждение при добавлении метаданных к ${productId}:`,
        data.updateMetadata.errors,
      );
    }

    return data.updateMetadata?.item;
  } catch (error) {
    console.error(
      `Ошибка при добавлении метаданных к продукту ${productId}:`,
      error.message,
    );
    // Не прерываем выполнение
  }
}

// Основная функция
async function main() {
  // Очищаем терминал для чистого вывода
  console.clear();

  // Валидация обязательных переменных окружения
  const missingVars = [];
  if (!API_URL) missingVars.push("NEXT_PUBLIC_SALEOR_API_URL");
  if (!APP_TOKEN) missingVars.push("SALEOR_APP_TOKEN");

  if (missingVars.length > 0) {
    console.log(
      "\n" +
        boxen(
          chalk.red.bold("❌ ОШИБКА КОНФИГУРАЦИИ\n\n") +
            chalk.white("Отсутствуют обязательные переменные окружения:\n\n") +
            missingVars.map((v) => chalk.yellow(`  • ${v}`)).join("\n") +
            "\n\n" +
            chalk.gray(
              "Убедитесь что файл .env содержит все необходимые переменные",
            ),
          {
            padding: 1,
            borderStyle: "round",
            borderColor: "red",
          },
        ),
    );
    console.log("");
    process.exit(1);
  }

  // Красивый заголовок
  console.log(
    "\n" +
      boxen(
        chalk.cyan.bold("🚀 AUTO IMAGE UPLOADER") +
          "\n\n" +
          chalk.gray(
            "Автоматическое добавление изображений из Google Images\n",
          ) +
          chalk.gray("в ваш Saleor каталог продуктов"),
        {
          padding: 1,
          margin: 1,
          borderStyle: "double",
          borderColor: "cyan",
          backgroundColor: "#1a1a1a",
        },
      ),
  );

  // Логируем старт
  log("INFO", "=== НАЧАЛО РАБОТЫ СКРИПТА ===");
  log("INFO", `API URL: ${API_URL}`);

  // Статус конфигурации
  console.log(chalk.bold("📋 Конфигурация:\n"));
  console.log(chalk.green("  ✓") + " Переменные окружения загружены");
  console.log(
    chalk.green("  ✓") +
      " Saleor API: " +
      chalk.cyan(API_URL.substring(0, 50) + "..."),
  );
  console.log(chalk.cyan("  ℹ") + " Лог файл: " + chalk.gray(logFilePath));
  console.log("");

  // Подключаемся к Chrome
  const spinner = ora({
    text: "Подключаюсь к Chrome...",
    color: "cyan",
    spinner: "dots",
  }).start();

  let browser;
  try {
    // Подключаемся к существующему Chrome через WebSocket
    const browserWSEndpoint = await fetch("http://localhost:9222/json/version")
      .then((res) => res.json())
      .then((data) => data.webSocketDebuggerUrl);

    browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: null,
    });

    spinner.succeed(chalk.green("Подключено к Chrome!"));
    console.log("");
  } catch (error) {
    spinner.fail(chalk.red("Не удалось подключиться к Chrome!"));
    console.log("");
    console.log(
      boxen(
        chalk.yellow.bold("⚠️  Chrome не запущен с remote debugging\n\n") +
          chalk.white("Запустите Chrome командой:\n") +
          chalk.cyan("pnpm chrome:debug\n\n") +
          chalk.gray("или вручную:\n") +
          chalk.gray(
            "/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome\n",
          ) +
          chalk.gray("  --remote-debugging-port=9222 &"),
        {
          padding: 1,
          borderStyle: "round",
          borderColor: "yellow",
        },
      ),
    );
    console.log("");
    throw error;
  }

  try {
    // Получаем продукты без изображений
    const fetchSpinner = ora(
      "Получаю список продуктов без изображений...",
    ).start();
    const productsWithoutImages = await fetchProductsWithoutImages();
    fetchSpinner.succeed(
      chalk.green(
        `Найдено ${chalk.bold(productsWithoutImages.length)} продуктов без изображений`,
      ),
    );
    console.log("");

    if (productsWithoutImages.length === 0) {
      console.log(
        boxen(
          chalk.green.bold("✨ Отлично!\n\n") +
            chalk.white("Все продукты уже имеют изображения"),
          {
            padding: 1,
            borderStyle: "round",
            borderColor: "green",
          },
        ),
      );
      return;
    }

    // Можно ограничить количество через переменную окружения IMAGES_LIMIT
    const LIMIT = process.env.IMAGES_LIMIT
      ? Number(process.env.IMAGES_LIMIT)
      : productsWithoutImages.length;
    const productsToProcess = productsWithoutImages.slice(0, LIMIT);

    // Настройки
    const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || "2", 10);

    // Выводим настройки обработки
    console.log(chalk.bold("⚙️  Настройки обработки:\n"));
    console.log(
      chalk.cyan("  •") +
        ` Всего продуктов: ${chalk.bold(productsWithoutImages.length)}`,
    );
    if (LIMIT < productsWithoutImages.length) {
      console.log(
        chalk.yellow("  •") + ` Лимит установлен: ${chalk.bold(LIMIT)} товаров`,
      );
    } else {
      console.log(
        chalk.green("  •") + ` Обрабатываем: ${chalk.bold("ВСЕ")} товары`,
      );
    }
    console.log(
      chalk.cyan("  •") + ` Макс. попыток: ${chalk.bold(MAX_RETRIES)}`,
    );
    console.log("");

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    const startTime = Date.now();

    // Создаём прогресс-бар с выравниванием столбцов
    const progressBar = new cliProgress.SingleBar(
      {
        format: function (options, params, payload) {
          const bar =
            options.barCompleteString.substring(
              0,
              Math.round(params.progress * options.barsize),
            ) +
            options.barIncompleteString.substring(
              0,
              Math.round((1 - params.progress) * options.barsize),
            );

          // Выравниваем числа справа (добавляем пробелы слева)
          const totalDigits = String(params.total || 0).length;
          const valueStr = String(params.value || 0).padStart(totalDigits, " ");
          const totalStr = String(params.total || 0);

          const successStr = String(payload.success || 0);
          const failStr = String(payload.fail || 0);
          const skipStr = String(payload.skip || 0);

          // Вычисляем процент вручную (библиотека даёт 0% когда value=1)
          const value = params.value || 0;
          const total = params.total || 1;
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

          // Вычисляем затраченное время
          const elapsed = Date.now() - startTime;
          const elapsedTime = formatDuration(elapsed);

          return (
            "📦 " +
            chalk.cyan(bar) +
            " | " +
            percentage +
            "% | " +
            valueStr +
            "/" +
            totalStr +
            " товаров | " +
            chalk.green("✓ " + successStr) +
            " " +
            chalk.red("✗ " + failStr) +
            " " +
            chalk.yellow("⏭ " + skipStr) +
            " | " +
            chalk.gray(elapsedTime)
          );
        },
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
        hideCursor: true,
        barsize: 20,
      },
      cliProgress.Presets.shades_classic,
    );

    progressBar.start(productsToProcess.length, 1, {
      success: successCount,
      fail: failCount,
      skip: skippedCount,
    });

    // Обрабатываем каждый продукт
    for (let i = 0; i < productsToProcess.length; i++) {
      const product = productsToProcess[i];
      const productNumber = i + 1;
      const productStartTime = Date.now();

      let retries = 0;
      let success = false;
      let progressBarStopped = false;
      const failCountBefore = failCount; // Запоминаем failCount до обработки

      // Retry логика
      while (retries <= MAX_RETRIES && !success) {
        try {
          // Ищем изображение в Google Images
          const imageUrl = await searchProductImage(
            product.name,
            browser,
            progressBar,
          );

          if (!imageUrl || imageUrl.length < 10) {
            throw new Error("Не удалось найти валидное изображение");
          }

          // Скачиваем изображение
          const imagePath = await downloadImage(imageUrl, product.name);

          // Загружаем изображение в Saleor
          await addProductImage(product.id, imagePath);

          // Добавляем метаданные
          await addProductMetadata(product.id, "autoImage", "true");

          successCount++;
          success = true;
          log("SUCCESS", "Изображение успешно добавлено", product.name);
        } catch (error) {
          // Логируем в файл, НЕ в консоль
          log(
            "ERROR",
            `Попытка ${retries + 1}/${MAX_RETRIES + 1}: ${error.message}`,
            product.name,
          );

          retries++;

          if (retries > MAX_RETRIES) {
            failCount++;
            log(
              "FAILED",
              `Все попытки исчерпаны: ${error.message}`,
              product.name,
            );
          } else if (retries <= MAX_RETRIES) {
            log(
              "RETRY",
              `Повторяю попытку ${retries}/${MAX_RETRIES}`,
              product.name,
            );
            await delay(3000);
          }
        }
      }

      // Если так и не получилось
      if (!success) {
        // Проверяем: был ли увеличен failCount для этого товара?
        // Если нет - значит это пропуск (не ошибка)
        if (failCount === failCountBefore) {
          skippedCount++;
        }
      }

      // Всегда возобновляем прогресс-бар перед update (на случай если он был остановлен капчей)
      // Используем try-catch потому что start() может быть вызван когда бар уже запущен
      try {
        // Проверяем что бар не запущен через internal state (нет публичного API для проверки)
        // Просто всегда вызываем start - это безопасно
        progressBar.start(productsToProcess.length, productNumber - 1, {
          success: successCount,
          fail: failCount,
          skip: skippedCount,
        });
      } catch (e) {
        // Игнорируем если уже запущен
      }
      progressBarStopped = false;

      // Обновляем прогресс-бар
      progressBar.update(productNumber, {
        success: successCount,
        fail: failCount,
        skip: skippedCount,
      });

      // Небольшая задержка между товарами
      await delay(1000);
    }

    // Завершаем прогресс-бар
    progressBar.stop();

    const totalTime = Date.now() - startTime;
    const avgTimePerProduct = successCount > 0 ? totalTime / successCount : 0;
    const successRate = Math.round(
      (successCount / productsToProcess.length) * 100,
    );

    // Финальная статистика в красивой рамке
    console.log("\n");

    // Собираем все строки с ПРАВИЛЬНЫМ выравниванием
    const lines = [];

    // Находим максимальную длину чисел
    const maxNumLength = Math.max(
      String(successCount).length,
      String(failCount).length,
      String(skippedCount).length,
      String(productsToProcess.length).length,
      String(productsWithoutImages.length).length,
    );

    // Находим максимальную длину меток для выравнивания колонки с числами/значениями
    const labels = [
      "Успешно:",
      "Ошибок:",
      "Пропущено:",
      "Обработано:",
      "Всего найдено:",
      "Общее время:",
      "Среднее/товар:",
    ];
    const maxLabelLength = Math.max(...labels.map((l) => stringWidth(l)));

    lines.push(chalk.bold.cyan("📊 ИТОГОВАЯ СТАТИСТИКА"));
    lines.push("");
    lines.push(chalk.bold("✅ Результаты обработки:"));
    lines.push(
      chalk.green(
        `   ✓ ${"Успешно:".padEnd(maxLabelLength)} ${chalk.bold(String(successCount).padStart(maxNumLength))} товаров`,
      ),
    );
    if (failCount > 0)
      lines.push(
        chalk.red(
          `   ✗ ${"Ошибок:".padEnd(maxLabelLength)} ${chalk.bold(String(failCount).padStart(maxNumLength))} товаров`,
        ),
      );
    if (skippedCount > 0)
      lines.push(
        chalk.yellow(
          `   ⏭ ${"Пропущено:".padEnd(maxLabelLength)} ${chalk.bold(String(skippedCount).padStart(maxNumLength))} товаров`,
        ),
      );
    lines.push(
      chalk.cyan(
        `   📦 ${"Обработано:".padEnd(maxLabelLength)} ${chalk.bold(String(productsToProcess.length).padStart(maxNumLength))} товаров`,
      ),
    );
    lines.push(
      chalk.gray(
        `   📋 ${"Всего найдено:".padEnd(maxLabelLength)} ${String(productsWithoutImages.length).padStart(maxNumLength)} товаров`,
      ),
    );
    lines.push("");
    lines.push(chalk.bold("⏱️  Время выполнения:"));
    lines.push(
      chalk.cyan(
        `   ⏰ ${"Общее время:".padEnd(maxLabelLength)} ${chalk.bold(formatDuration(totalTime))}`,
      ),
    );
    lines.push(
      chalk.cyan(
        `   ⚡ ${"Среднее/товар:".padEnd(maxLabelLength)} ${chalk.bold(formatDuration(avgTimePerProduct))}`,
      ),
    );
    lines.push("");
    lines.push(chalk.bold("📈 Успешность:"));
    lines.push(
      successRate >= 90
        ? chalk.green(`   🎉 ${chalk.bold(successRate + "%")} - Отлично!`)
        : successRate >= 70
          ? chalk.yellow(`   👍 ${chalk.bold(successRate + "%")} - Хорошо`)
          : chalk.red(
              `   ⚠️  ${chalk.bold(successRate + "%")} - Требует внимания`,
            ),
    );

    // Вручную выравниваем все строки используя string-width для правильного подсчета ширины
    const stripAnsi = (str) => str.replace(/\x1B\[[0-9;]*m/g, "");

    // Находим максимальную визуальную ширину среди всех строк
    const maxWidth = Math.max(
      ...lines.map((line) => {
        const clean = stripAnsi(line);
        return stringWidth(clean);
      }),
    );

    // Дополняем каждую строку пробелами до максимальной ширины
    const paddedLines = lines.map((line) => {
      const clean = stripAnsi(line);
      const width = stringWidth(clean);
      const padding = maxWidth - width;
      return line + " ".repeat(Math.max(0, padding));
    });

    const content = paddedLines.join("\n");

    console.log(
      boxen(content, {
        padding: 1,
        margin: 1,
        borderStyle: "double",
        borderColor:
          successRate >= 90 ? "green" : successRate >= 70 ? "yellow" : "red",
      }),
    );

    console.log(chalk.green.bold("✨ Обработка завершена!\n"));
    console.log(chalk.gray(`📝 Детальный лог сохранен: ${logFilePath}\n`));
  } finally {
    // Отключаемся от браузера (НЕ закрываем его, так как он был уже открыт)
    if (browser) {
      await browser.disconnect();
      console.log(
        chalk.gray("🌐 Отключено от браузера (Chrome остается открытым)\n"),
      );
    }

    // Закрываем лог файл
    logStream.end();
  }
}

// Graceful shutdown handling
let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("\n\n");
  console.log(
    boxen(
      chalk.yellow.bold("⏸️  ОСТАНОВКА СКРИПТА\n\n") +
        chalk.white(`Получен сигнал: ${signal}\n`) +
        chalk.gray("Корректно завершаю работу..."),
      {
        padding: 1,
        borderStyle: "round",
        borderColor: "yellow",
        textAlignment: "center",
      },
    ),
  );
  console.log("");

  // Browser будет отключен в finally блоке main()
  log("INFO", `Graceful shutdown: ${signal}`);
  logStream.end();
  process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT (Ctrl+C)"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Запуск скрипта
main().catch((error) => {
  console.log("\n");
  console.log(
    boxen(
      chalk.red.bold("❌ КРИТИЧЕСКАЯ ОШИБКА\n\n") +
        chalk.white(error.message || String(error)),
      {
        padding: 1,
        borderStyle: "round",
        borderColor: "red",
      },
    ),
  );
  console.log("");
  process.exit(1);
});
