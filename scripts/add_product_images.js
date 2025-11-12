const fs = require("fs");
const path = require("path");
const os = require("os");
const FormData = require("form-data");
const axios = require("axios");
const puppeteer = require("puppeteer");
const AntiCaptchaClient = require("./anticaptcha-client");

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
  console.log("✅ Переменные окружения загружены из .env");
}

const API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const APP_TOKEN = process.env.SALEOR_APP_TOKEN;
const ANTICAPTCHA_API_KEY = process.env.ANTICAPTCHA_API_KEY;

if (!API_URL || !APP_TOKEN) {
  throw new Error(
    "NEXT_PUBLIC_SALEOR_API_URL и SALEOR_APP_TOKEN должны быть заданы в переменных окружения."
  );
}

// Инициализируем Anti-Captcha клиент (если ключ задан)
let antiCaptchaClient = null;
if (ANTICAPTCHA_API_KEY) {
  antiCaptchaClient = new AntiCaptchaClient(ANTICAPTCHA_API_KEY);
  console.log("✅ Anti-Captcha интеграция активна");
} else {
  console.log("⚠️  Anti-Captcha ключ не задан, капчи нужно будет решать вручную");
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Случайная задержка (более человечная)
const randomDelay = (min, max) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
};

// Очистка имени файла от недопустимых символов
function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, '') // Удаляем недопустимые символы
    .replace(/\s+/g, '_')          // Пробелы заменяем на underscore
    .replace(/_{2,}/g, '_')        // Множественные underscore на один
    .replace(/^[._]+|[._]+$/g, '') // Удаляем точки/underscore в начале и конце
    .substring(0, 100);            // Ограничиваем длину до 100 символов
}

// Форматирование времени
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}м ${remainingSeconds}с`;
  }
  return `${seconds}с`;
}

// Проверка наличия капчи на странице
async function detectCaptcha(page) {
  try {
    const captchaSelectors = [
      'iframe[src*="recaptcha"]',
      '#recaptcha',
      '.g-recaptcha',
      'iframe[title*="reCAPTCHA"]',
      '[id*="captcha"]',
      '[class*="captcha"]',
    ];

    for (const selector of captchaSelectors) {
      const captchaElement = await page.$(selector);
      if (captchaElement) {
        return true;
      }
    }

    // Проверяем текст на странице
    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    if (pageText.includes('captcha') || pageText.includes('unusual traffic')) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

// Ожидание решения капчи пользователем
async function waitForCaptchaSolution(page, maxWaitMinutes = 5) {
  console.log(`\n    ⚠️  🤖 ОБНАРУЖЕНА КАПЧА!`);
  console.log(`    ⏳ Ожидаю решения капчи...`);
  console.log(`    👉 Пожалуйста, решите капчу в открытом окне Chrome`);
  console.log(`    ⏰ Жду максимум ${maxWaitMinutes} минут\n`);

  const maxWaitMs = maxWaitMinutes * 60 * 1000;
  const checkInterval = 3000; // Проверяем каждые 3 секунды
  let elapsedMs = 0;

  while (elapsedMs < maxWaitMs) {
    await delay(checkInterval);
    elapsedMs += checkInterval;

    const hasCaptcha = await detectCaptcha(page);

    if (!hasCaptcha) {
      console.log(`    ✅ Капча решена! Продолжаю работу...\n`);
      // Дополнительная пауза после решения капчи
      await randomDelay(3000, 5000);
      return true;
    }

    // Показываем прогресс каждые 15 секунд
    if (elapsedMs % 15000 === 0) {
      const minutesElapsed = Math.floor(elapsedMs / 60000);
      console.log(`    ⏳ Прошло ${minutesElapsed} мин, всё еще жду решения капчи...`);
    }
  }

  throw new Error(`Капча не была решена за ${maxWaitMinutes} минут`);
}

/**
 * Извлечь sitekey reCAPTCHA со страницы
 */
async function extractRecaptchaSiteKey(page) {
  try {
    const siteKey = await page.evaluate(() => {
      // Способ 1: Ищем в iframe src
      const iframe = document.querySelector('iframe[src*="recaptcha"]');
      if (iframe) {
        const src = iframe.src;
        const match = src.match(/[?&]k=([^&]+)/);
        if (match) return match[1];
      }

      // Способ 2: Ищем data-sitekey атрибут
      const recaptchaDiv = document.querySelector('[data-sitekey]');
      if (recaptchaDiv) {
        return recaptchaDiv.getAttribute('data-sitekey');
      }

      // Способ 3: Ищем в grecaptcha.render вызовах в скриптах
      const scripts = Array.from(document.getElementsByTagName('script'));
      for (const script of scripts) {
        if (script.textContent && script.textContent.includes('grecaptcha')) {
          const match = script.textContent.match(/sitekey['":\s]+(['"])([^'"]+)\1/);
          if (match) return match[2];
        }
      }

      return null;
    });

    return siteKey;
  } catch (error) {
    console.error(`    ❌ Ошибка извлечения sitekey: ${error.message}`);
    return null;
  }
}

/**
 * Внедрить токен решения капчи в страницу
 */
async function injectCaptchaSolution(page, gRecaptchaResponse) {
  try {
    await page.evaluate((token) => {
      // Способ 1: Устанавливаем значение в textarea
      const textarea = document.getElementById('g-recaptcha-response');
      if (textarea) {
        textarea.innerHTML = token;
        textarea.value = token;
      }

      // Способ 2: Ищем все textarea с g-recaptcha-response (могут быть несколько)
      const textareas = document.querySelectorAll('textarea[name="g-recaptcha-response"]');
      textareas.forEach(t => {
        t.innerHTML = token;
        t.value = token;
      });

      // Способ 3: Вызываем callback если он есть
      if (typeof window.captchaCallback === 'function') {
        window.captchaCallback(token);
      }

      // Способ 4: Триггерим события
      const event = new Event('change', { bubbles: true });
      if (textarea) {
        textarea.dispatchEvent(event);
      }
    }, gRecaptchaResponse);

    console.log(`    ✅ Токен решения внедрён в страницу`);
    return true;
  } catch (error) {
    console.error(`    ❌ Ошибка внедрения токена: ${error.message}`);
    return false;
  }
}

/**
 * Автоматически решить капчу через Anti-Captcha
 */
async function solveRecaptchaAutomatically(page) {
  if (!antiCaptchaClient) {
    console.log(`    ⚠️  Anti-Captcha не настроен, пропускаю автоматическое решение`);
    return false;
  }

  try {
    console.log(`\n    🤖 ОБНАРУЖЕНА КАПЧА! Запускаю автоматическое решение...`);

    // Получаем текущий URL
    const currentURL = page.url();
    console.log(`    🌐 URL: ${currentURL}`);

    // Извлекаем sitekey
    const siteKey = await extractRecaptchaSiteKey(page);
    if (!siteKey) {
      console.log(`    ❌ Не удалось извлечь sitekey, пропускаю автоматическое решение`);
      return false;
    }

    // Решаем капчу через Anti-Captcha
    const gRecaptchaResponse = await antiCaptchaClient.solveRecaptchaV2(
      currentURL,
      siteKey
    );

    // Внедряем решение в страницу
    await injectCaptchaSolution(page, gRecaptchaResponse);

    // Даём странице время обработать решение
    await randomDelay(2000, 3000);

    // Проверяем что капча исчезла
    const stillHasCaptcha = await detectCaptcha(page);
    if (!stillHasCaptcha) {
      console.log(`    ✅ Капча успешно решена автоматически!\n`);
      return true;
    } else {
      console.log(`    ⚠️  Капча всё ещё присутствует, возможно нужна дополнительная обработка`);
      // Пробуем перезагрузить страницу или нажать кнопку продолжить
      await randomDelay(1000, 2000);
      return false;
    }
  } catch (error) {
    console.error(`    ❌ Ошибка автоматического решения: ${error.message}`);
    return false;
  }
}

/**
 * Обработать капчу (автоматически или вручную)
 * Сначала пробует автоматическое решение, затем fallback на ручное
 */
async function handleCaptcha(page) {
  // Пробуем автоматическое решение
  const autoSolved = await solveRecaptchaAutomatically(page);

  if (autoSolved) {
    return true; // Успешно решено автоматически
  }

  // Если автоматическое решение не сработало, fallback на ручное
  if (!antiCaptchaClient) {
    console.log(`    💡 Переключаюсь на ручное решение капчи...`);
  } else {
    console.log(`    💡 Автоматическое решение не сработало, переключаюсь на ручное...`);
  }

  await waitForCaptchaSolution(page);
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
      `Ошибка сети при запросе к Saleor (попытка ${attempt + 1}). Ждем ${waitMs} мс`
    );
    await delay(waitMs);
    return graphqlRequest(query, variables, attempt + 1);
  }

  const json = await response.json();

  if (json?.type === "Too Many Requests") {
    if (attempt >= 5) {
      throw new Error(
        `Saleor API ограничил запросы после нескольких попыток: ${JSON.stringify(
          json
        )}`
      );
    }
    const waitMs = 2000 * (attempt + 1);
    console.warn(
      `Получен ответ о лимите запросов. Ожидаем ${waitMs} мс перед повтором…`
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
      `Пустой ответ от GraphQL: ${JSON.stringify(json, null, 2)}`
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

// Поиск изображения через Google Images с помощью Puppeteer (как человек)
async function searchProductImage(productName, browser) {
  let page;
  try {
    page = await browser.newPage();

    // Устанавливаем User-Agent чтобы Google не банил
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log(`    🔍 Открываю Google: "${productName.substring(0, 50)}..."`);

    // ШАГ 1: Открываем обычный Google (как человек)
    await page.goto("https://www.google.com", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Проверяем капчу сразу после загрузки
    if (await detectCaptcha(page)) {
      await handleCaptcha(page);
    }

    await randomDelay(1500, 2500); // Случайная задержка как человек

    // ШАГ 2: Находим поле поиска и вводим запрос (как человек)
    const searchBoxSelector = 'textarea[name="q"], input[name="q"]';
    await page.waitForSelector(searchBoxSelector, { timeout: 10000 });

    console.log(`    ⌨️  Ввожу запрос...`);
    // Печатаем с более случайной задержкой между символами (80-150ms)
    await page.type(searchBoxSelector, productName, {
      delay: Math.floor(Math.random() * 70) + 80
    });
    await randomDelay(800, 1200); // Случайная пауза перед Enter

    // ШАГ 3: Нажимаем Enter (как человек)
    await page.keyboard.press("Enter");
    await randomDelay(2500, 3500); // Случайная задержка для результатов

    // ШАГ 4: Кликаем на вкладку "Картинки" (как человек)
    console.log(`    🖱️  Перехожу на вкладку Картинки...`);

    // Проверяем капчу перед переходом на Images
    if (await detectCaptcha(page)) {
      await handleCaptcha(page);
    }

    try {
      // Ищем ссылку на Images/Картинки
      await page.waitForSelector('a[href*="tbm=isch"]', { timeout: 5000 });
      await randomDelay(500, 1000); // Небольшая пауза перед кликом
      await page.click('a[href*="tbm=isch"]');
      await randomDelay(3500, 4500); // Случайная задержка для загрузки изображений
    } catch (e) {
      // Если не нашли вкладку, пробуем прямой переход
      const searchQuery = encodeURIComponent(productName);
      await page.goto(`https://www.google.com/search?q=${searchQuery}&tbm=isch`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
      await randomDelay(2500, 3500);
    }

    // ШАГ 5: Проверяем капчу перед поиском изображений
    if (await detectCaptcha(page)) {
      await handleCaptcha(page);
    }

    // ШАГ 6: Ждем загрузки изображений
    console.log(`    📸 Ищу изображения...`);
    try {
      // Ждем появления контейнера с результатами изображений
      await page.waitForSelector('div[data-ri], img[data-src], .ivg-i img', { timeout: 10000 });
    } catch (waitError) {
      // Сохраняем скриншот для отладки
      const screenshotPath = path.join(os.tmpdir(), `debug-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`    🔍 Скриншот сохранен: ${screenshotPath}`);

      // Возможно это капча
      if (await detectCaptcha(page)) {
        await handleCaptcha(page);
        // Пробуем еще раз после решения капчи
        await page.waitForSelector('div[data-ri], img[data-src], .ivg-i img', { timeout: 10000 });
      } else {
        throw new Error("Не дождались загрузки изображений на странице Google");
      }
    }
    await randomDelay(2000, 3000); // Случайная задержка

    // ШАГ 6: Находим первое изображение в результатах и кликаем на него
    console.log(`    🖱️  Кликаю на первое изображение...`);
    let imageClicked = false;
    try {
      // Пробуем разные селекторы для нахождения первого изображения в результатах
      const selectors = [
        'div[data-ri="0"] img', // Первый результат по data-ri
        '.ivg-i img',            // Изображения в grid
        'img[data-src]',         // Изображения с data-src
        'div.isv-r img'          // Результаты поиска
      ];

      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          imageClicked = true;
          console.log(`    ✓ Кликнул на изображение (селектор: ${selector})`);
          break;
        } catch (e) {
          // Пробуем следующий селектор
        }
      }

      if (!imageClicked) {
        throw new Error("Не нашел изображение для клика");
      }

      await randomDelay(2500, 3500); // Случайная задержка для панели
    } catch (clickError) {
      const screenshotPath = path.join(os.tmpdir(), `debug-click-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`    🔍 Скриншот (ошибка клика): ${screenshotPath}`);
      throw new Error(`Не удалось кликнуть на изображение: ${clickError.message}`);
    }

    // ШАГ 7: Извлекаем URL полноразмерного изображения
    console.log(`    🔍 Извлекаю URL полноразмерного изображения...`);
    const imageUrl = await page.evaluate(() => {
      // После клика Google показывает полноразмерное изображение в панели справа
      // Пробуем разные способы найти полноразмерное изображение

      // Способ 1: Изображение в панели предпросмотра
      const previewImg = document.querySelector('img.sFlh5c, img.iPVvYb, img.n3VNCb, img[data-iml]');
      if (previewImg && previewImg.src && previewImg.src.startsWith('http')) {
        return previewImg.src;
      }

      // Способ 2: Ссылка на оригинальное изображение
      const imgLink = document.querySelector('a[href*="imgurl="], a[jsname="sTFXNd"]');
      if (imgLink) {
        const href = imgLink.href;
        const match = href.match(/imgurl=([^&]+)/);
        if (match) {
          return decodeURIComponent(match[1]);
        }
      }

      // Способ 3: Любое большое изображение на странице (fallback)
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
          !src.includes("google.com/images/branding") &&
          !src.includes("gstatic.com/images") &&
          (src.startsWith("http://") || src.startsWith("https://"))
        ) {
          return src;
        }
      }

      return null;
    });

    if (!imageUrl) {
      // Сохраняем скриншот для отладки
      const screenshotPath = path.join(os.tmpdir(), `debug-no-image-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`    🔍 Скриншот (изображение не найдено): ${screenshotPath}`);

      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.warn(`    ⚠️  Предупреждение при закрытии страницы: ${closeError.message}`);
        }
      }
      throw new Error("Не удалось найти изображение товара");
    }

    // Проверяем что URL выглядит валидным
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp)/i;
    const isValidImageUrl = urlPattern.test(imageUrl) || imageUrl.length > 50;

    console.log(`    ✓ Найдено изображение:`);
    console.log(`      URL: ${imageUrl.substring(0, 100)}${imageUrl.length > 100 ? '...' : ''}`);
    console.log(`      Длина URL: ${imageUrl.length} символов`);
    console.log(`      Валидный URL: ${isValidImageUrl ? 'Да' : 'Возможно нет (но попробуем)'}`);

    if (!isValidImageUrl) {
      console.warn(`    ⚠️  Предупреждение: URL может быть невалидным, но продолжаем...`);
    }

    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.warn(`    ⚠️  Предупреждение при закрытии страницы: ${closeError.message}`);
      }
    }
    return imageUrl;
  } catch (error) {
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        // Игнорируем ошибки при закрытии в блоке catch
      }
    }
    throw new Error(`Ошибка поиска: ${error.message}`);
  }
}

// Скачать изображение
async function downloadImage(imageUrl, productName = null) {
  try {
    console.log(`    🌐 Скачиваю изображение...`);
    console.log(`      URL: ${imageUrl.substring(0, 80)}...`);

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.google.com/",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    // Определяем расширение файла по Content-Type
    const contentType = response.headers['content-type'] || '';
    let extension = 'jpg';
    if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('webp')) extension = 'webp';
    else if (contentType.includes('gif')) extension = 'gif';
    else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';

    const buffer = Buffer.from(response.data);
    const sizeKB = (buffer.length / 1024).toFixed(2);

    console.log(`      Content-Type: ${contentType}`);
    console.log(`      Размер: ${sizeKB} KB`);
    console.log(`      Расширение: .${extension}`);

    // Проверяем что скачали не пустой файл
    if (buffer.length < 1000) {
      throw new Error(`Файл слишком маленький (${buffer.length} байт), возможно это не изображение`);
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

    console.log(`      ✓ Сохранено во временную папку: ${filename}`);

    return tempFilePath;
  } catch (error) {
    if (error.response) {
      throw new Error(`Не удалось скачать изображение: HTTP ${error.response.status} ${error.response.statusText}`);
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
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
    };

    const contentType = contentTypeMap[extension] || 'image/jpeg';
    const filename = `product${extension}`;

    console.log(`    📎 Тип файла: ${contentType}`);
    console.log(`    📎 Имя файла: ${filename}`);

    const form = new FormData();

    const operations = {
      query: mutation,
      variables: {
        productId,
        image: null,
      },
    };

    const map = {
      "0": ["variables.image"],
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
          json.data.productMediaCreate.errors
        )}`
      );
    }

    const result = json.data?.productMediaCreate;

    // Выводим информацию о загруженном изображении
    if (result?.media && result.media.length > 0) {
      const uploadedMedia = result.media[result.media.length - 1]; // Последнее добавленное изображение
      console.log(`    ✅ Изображение загружено в Saleor:`);
      console.log(`       ID: ${uploadedMedia.id}`);
      console.log(`       URL: ${uploadedMedia.url}`);
      console.log(`       Тип: ${uploadedMedia.type}`);

      // Проверяем доступность URL
      if (uploadedMedia.url) {
        console.log(`    🔗 Изображение будет доступно по ссылке: ${uploadedMedia.url}`);
      }
    }

    return result?.product;
  } catch (error) {
    console.error(
      `Ошибка при добавлении изображения к продукту ${productId}:`,
      error.message
    );
    throw error;
  } finally {
    // Удаляем временный файл (если не установлен флаг KEEP_IMAGES)
    const keepImages = process.env.KEEP_IMAGES === 'true';

    if (keepImages) {
      // Сохраняем файл в папку downloaded_images
      try {
        const downloadedDir = path.join(__dirname, 'downloaded_images');
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
          finalPath = path.join(downloadedDir, `${nameWithoutExt}_${counter}${ext}`);
          counter++;
        }

        fs.copyFileSync(imagePath, finalPath);
        console.log(`    💾 Изображение сохранено: ${path.basename(finalPath)}`);

        // Удаляем временный файл
        fs.unlinkSync(imagePath);
      } catch (saveError) {
        console.warn(`    ⚠️  Не удалось сохранить изображение: ${saveError.message}`);
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
          cleanupError.message
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

    if (
      data.updateMetadata?.errors &&
      data.updateMetadata.errors.length > 0
    ) {
      console.warn(
        `Предупреждение при добавлении метаданных к ${productId}:`,
        data.updateMetadata.errors
      );
    }

    return data.updateMetadata?.item;
  } catch (error) {
    console.error(
      `Ошибка при добавлении метаданных к продукту ${productId}:`,
      error.message
    );
    // Не прерываем выполнение
  }
}

// Основная функция
async function main() {
  console.log("🚀 Начинаем добавление изображений к продуктам...\n");

  // Подключаемся к уже запущенному Chrome через DevTools Protocol
  console.log("🌐 Подключаюсь к открытому Chrome...");
  console.log("⚠️  ВАЖНО: Перед запуском скрипта запустите Chrome с флагом remote debugging:");
  console.log('   /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222');
  console.log("   Или используйте уже открытый Chrome, если он запущен с этим флагом.\n");

  let browser;
  try {
    // Подключаемся к существующему Chrome через WebSocket
    const browserWSEndpoint = await fetch('http://localhost:9222/json/version')
      .then(res => res.json())
      .then(data => data.webSocketDebuggerUrl);

    browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: null,
    });

    console.log("✅ Подключено к Chrome!\n");
  } catch (error) {
    console.error("\n❌ Не удалось подключиться к Chrome!");
    console.error("Убедитесь, что Chrome запущен с флагом --remote-debugging-port=9222");
    console.error("\nЗапустите в терминале:");
    console.error('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 &\n');
    throw error;
  }

  try {
    // Получаем продукты без изображений
    console.log("📦 Получаем список продуктов без изображений...");
    const productsWithoutImages = await fetchProductsWithoutImages();

    console.log(
      `\n✅ Найдено ${productsWithoutImages.length} продуктов без изображений\n`
    );

    if (productsWithoutImages.length === 0) {
      console.log("✨ Все продукты уже имеют изображения!");
      return;
    }

    // Можно ограничить количество через переменную окружения IMAGES_LIMIT
    // Например: IMAGES_LIMIT=10 pnpm images:add
    const LIMIT = process.env.IMAGES_LIMIT
      ? Number(process.env.IMAGES_LIMIT)
      : productsWithoutImages.length; // По умолчанию обрабатываем ВСЕ товары
    const productsToProcess = productsWithoutImages.slice(0, LIMIT);

    if (LIMIT < productsWithoutImages.length) {
      console.log(
        `⚠️  ЛИМИТ УСТАНОВЛЕН: Обрабатываем только первые ${LIMIT} товаров из ${productsWithoutImages.length}\n`
      );
    } else {
      console.log(
        `✅ Обрабатываем ВСЕ товары без изображений: ${productsWithoutImages.length}\n`
      );
    }

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    let captchaCount = 0;
    const startTime = Date.now();

    // Настройки пауз из переменных окружения (или по умолчанию)
    const PAUSE_EVERY_10 = parseInt(process.env.PAUSE_EVERY_10 || '10', 10);
    const PAUSE_EVERY_30 = parseInt(process.env.PAUSE_EVERY_30 || '30', 10);
    const PAUSE_EVERY_50 = parseInt(process.env.PAUSE_EVERY_50 || '50', 10);
    const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '2', 10);

    console.log("💡 Настройки:");
    console.log(`   • Макс. попыток на товар: ${MAX_RETRIES}`);
    console.log(`   • После каждых ${PAUSE_EVERY_10} товаров: пауза 15-25 секунд`);
    console.log(`   • После каждых ${PAUSE_EVERY_30} товаров: пауза 30-45 секунд`);
    console.log(`   • После каждых ${PAUSE_EVERY_50} товаров: пауза 45-60 секунд`);
    console.log("   • Случайные задержки между запросами\n");

    // Обрабатываем каждый продукт
    for (let i = 0; i < productsToProcess.length; i++) {
      const product = productsToProcess[i];
      const progress = `[${i + 1}/${productsToProcess.length}]`;
      const productNumber = i + 1;
      const productStartTime = Date.now();

      let retries = 0;
      let success = false;

      // Retry логика
      while (retries <= MAX_RETRIES && !success) {
        try {
          if (retries > 0) {
            console.log(`${progress} 🔄 Повторная попытка ${retries}/${MAX_RETRIES}: ${product.name}`);
          } else {
            console.log(`${progress} 📦 Обработка: ${product.name}`);
          }

          // Ищем изображение в Google Images
          const imageUrl = await searchProductImage(product.name, browser);

          // Проверяем что изображение найдено
          if (!imageUrl || imageUrl.length < 10) {
            throw new Error("Не удалось найти валидное изображение");
          }

          // Случайная задержка между поиском и скачиванием (2-4 сек)
          await randomDelay(2000, 4000);

          // Скачиваем изображение (функция сама выводит подробную информацию)
          const imagePath = await downloadImage(imageUrl, product.name);
          await randomDelay(500, 1000);

          // Загружаем изображение в Saleor
          console.log(`  ⬆️  Загрузка изображения в Saleor...`);
          await addProductImage(product.id, imagePath);
          await randomDelay(1000, 1500);

          // Добавляем метаданные
          console.log(`  🏷️  Добавление метаданных (autoImage: true)...`);
          await addProductMetadata(product.id, "autoImage", "true");
          await randomDelay(800, 1200);

          const productTime = Date.now() - productStartTime;
          console.log(`  ✅ Успешно добавлено изображение! (${formatDuration(productTime)})\n`);
          successCount++;
          success = true;

        } catch (error) {
          // Проверяем капчу
          if (error.message.includes('captcha') || error.message.includes('Капча')) {
            captchaCount++;
            console.log(`  ⚠️  Капча обнаружена (всего капч: ${captchaCount})`);
            console.log(`⏸️  Делаю паузу после капчи (10 секунд)...\n`);
            await delay(10000);
          }

          retries++;

          if (retries > MAX_RETRIES) {
            console.error(`  ❌ Ошибка после ${MAX_RETRIES} попыток: ${error.message}\n`);
            failCount++;
          } else if (retries <= MAX_RETRIES) {
            console.log(`  ⚠️  Ошибка: ${error.message}`);
            console.log(`  🔄 Повторю попытку через 5 секунд...\n`);
            await delay(5000);
          }
        }
      }

      // Если так и не получилось, пропускаем
      if (!success) {
        skippedCount++;
      }

      // УМНЫЕ ПАУЗЫ: чтобы Google не банил (только если успешно обработали)
      if (success && productNumber < productsToProcess.length) {
        // Каждые 50 товаров - длинная пауза
        if (productNumber % PAUSE_EVERY_50 === 0) {
          const pauseSec = Math.floor(Math.random() * 15) + 45; // 45-60 сек
          console.log(`⏸️  Обработано ${productNumber} товаров. Длинная пауза ${pauseSec} секунд...\n`);
          await delay(pauseSec * 1000);
        }
        // Каждые 30 товаров - средняя пауза
        else if (productNumber % PAUSE_EVERY_30 === 0) {
          const pauseSec = Math.floor(Math.random() * 15) + 30; // 30-45 сек
          console.log(`⏸️  Обработано ${productNumber} товаров. Средняя пауза ${pauseSec} секунд...\n`);
          await delay(pauseSec * 1000);
        }
        // Каждые 10 товаров - короткая пауза
        else if (productNumber % PAUSE_EVERY_10 === 0) {
          const pauseSec = Math.floor(Math.random() * 10) + 15; // 15-25 сек
          console.log(`⏸️  Обработано ${productNumber} товаров. Короткая пауза ${pauseSec} секунд...\n`);
          await delay(pauseSec * 1000);
        }
      }
    }

    const totalTime = Date.now() - startTime;
    const avgTimePerProduct = successCount > 0 ? totalTime / successCount : 0;

    console.log("\n" + "=".repeat(70));
    console.log(`\n📊 ИТОГОВАЯ СТАТИСТИКА`);
    console.log("=".repeat(70));
    console.log(`\n✅ Результаты обработки:`);
    console.log(`   • Успешно обработано:          ${successCount} товаров`);
    console.log(`   • Ошибок (после всех попыток): ${failCount} товаров`);
    console.log(`   • Пропущено:                   ${skippedCount} товаров`);
    console.log(`   • Всего обработано:            ${productsToProcess.length} товаров`);
    console.log(`   • Всего найдено без изображ.:  ${productsWithoutImages.length} товаров`);

    console.log(`\n⏱️  Время выполнения:`);
    console.log(`   • Общее время:                 ${formatDuration(totalTime)}`);
    console.log(`   • Среднее время на товар:      ${formatDuration(avgTimePerProduct)}`);

    console.log(`\n🤖 Статистика капчи:`);
    console.log(`   • Капч обнаружено:             ${captchaCount}`);
    console.log(`   • Частота капчи:               ~${successCount > 0 ? Math.round((captchaCount / successCount) * 100) : 0}% от товаров`);

    if (successCount > 0) {
      const successRate = Math.round((successCount / productsToProcess.length) * 100);
      console.log(`\n📈 Успешность:`);
      console.log(`   • Процент успешных:            ${successRate}%`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("\n✨ Готово!\n");
  } finally {
    // Отключаемся от браузера (НЕ закрываем его, так как он был уже открыт)
    if (browser) {
      await browser.disconnect();
      console.log("🌐 Отключено от браузера (Chrome остается открытым)");
    }
  }
}

// Запуск скрипта
main().catch((error) => {
  console.error("\n❌ Критическая ошибка:", error);
  process.exit(1);
});
