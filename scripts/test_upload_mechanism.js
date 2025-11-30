const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

// Этот скрипт показывает КАК ИМЕННО работает загрузка файла в Saleor

console.log(
  "╔════════════════════════════════════════════════════════════════╗",
);
console.log(
  "║  Демонстрация механизма загрузки изображения в Saleor         ║",
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝\n",
);

console.log("📚 Как работает загрузка файла в Saleor через GraphQL:\n");

console.log("1️⃣  СКАЧИВАНИЕ ИЗОБРАЖЕНИЯ");
console.log("    Google Images → /tmp/product-123456.jpg");
console.log("    Файл сохраняется локально на вашем компьютере\n");

console.log("2️⃣  СОЗДАНИЕ MULTIPART/FORM-DATA ЗАПРОСА");
console.log("    Используется спецификация GraphQL multipart request:");
console.log(
  "    https://github.com/jaydenseric/graphql-multipart-request-spec\n",
);

console.log("    Структура запроса:");
console.log("    ┌─────────────────────────────────────────────────┐");
console.log("    │ Part 1: 'operations' (JSON)                     │");
console.log("    │ {                                               │");
console.log("    │   query: 'mutation ProductMediaCreate(...)',    │");
console.log("    │   variables: {                                  │");
console.log("    │     productId: 'Product:123',                   │");
console.log("    │     image: null  ← файл подставится сюда!       │");
console.log("    │   }                                             │");
console.log("    │ }                                               │");
console.log("    └─────────────────────────────────────────────────┘");
console.log("    ┌─────────────────────────────────────────────────┐");
console.log("    │ Part 2: 'map' (JSON)                            │");
console.log("    │ {                                               │");
console.log("    │   '0': ['variables.image']                      │");
console.log("    │   ↑     ↑                                       │");
console.log("    │   │     └─ Куда подставить                      │");
console.log("    │   └─ Имя файла в form-data                      │");
console.log("    │ }                                               │");
console.log("    └─────────────────────────────────────────────────┘");
console.log("    ┌─────────────────────────────────────────────────┐");
console.log("    │ Part 3: '0' (FILE)                              │");
console.log("    │ Content-Type: image/jpeg                        │");
console.log("    │ <BINARY FILE DATA>                              │");
console.log("    └─────────────────────────────────────────────────┘\n");

console.log("3️⃣  ОТПРАВКА В SALEOR");
console.log("    POST https://your-saleor.com/graphql/");
console.log("    Content-Type: multipart/form-data");
console.log("    Authorization: Bearer YOUR_APP_TOKEN\n");

console.log("4️⃣  ОБРАБОТКА В SALEOR");
console.log("    ✓ Saleor парсит multipart запрос");
console.log("    ✓ Читает файл из части '0'");
console.log("    ✓ Подставляет файл в variables.image");
console.log("    ✓ Валидирует изображение (размер, формат)");
console.log("    ✓ Сохраняет файл в хранилище:");
console.log("      - AWS S3 (если настроен)");
console.log("      - Google Cloud Storage (если настроен)");
console.log("      - Локальная ФС /media/ (по умолчанию)");
console.log("    ✓ Создает запись ProductMedia в БД");
console.log("    ✓ Возвращает постоянный URL\n");

console.log("5️⃣  ОТВЕТ ОТ SALEOR");
console.log("    {");
console.log("      'data': {");
console.log("        'productMediaCreate': {");
console.log("          'product': { 'id': 'Product:123', ... },");
console.log("          'media': [");
console.log("            {");
console.log("              'id': 'ProductMedia:456',");
console.log(
  "              'url': 'https://cdn.saleor.com/media/products/product_abc.jpg',",
);
console.log("              'type': 'IMAGE'");
console.log("            }");
console.log("          ]");
console.log("        }");
console.log("      }");
console.log("    }\n");

console.log("6️⃣  РЕЗУЛЬТАТ");
console.log("    ✅ Файл загружен в Saleor");
console.log("    ✅ Изображение доступно по URL");
console.log("    ✅ URL будет работать всегда (файл хранится у вас)");
console.log("    ✅ НЕ зависит от внешних источников\n");

console.log(
  "════════════════════════════════════════════════════════════════\n",
);

console.log("💡 Пример кода (из add_product_images.js):\n");
console.log("```javascript");
console.log("const form = new FormData();");
console.log("");
console.log("// GraphQL операция");
console.log("form.append('operations', JSON.stringify({");
console.log("  query: mutation,");
console.log("  variables: { productId, image: null }");
console.log("}));");
console.log("");
console.log("// Карта соответствий");
console.log("form.append('map', JSON.stringify({");
console.log("  '0': ['variables.image']");
console.log("}));");
console.log("");
console.log("// Файл");
console.log("form.append('0', fs.createReadStream(imagePath), {");
console.log("  filename: 'product.jpg',");
console.log("  contentType: 'image/jpeg'");
console.log("});");
console.log("");
console.log("// Отправка");
console.log("await axios.post(SALEOR_API_URL, form, {");
console.log("  headers: {");
console.log("    ...form.getHeaders(),");
console.log("    Authorization: 'Bearer TOKEN'");
console.log("  }");
console.log("});");
console.log("```\n");

console.log(
  "════════════════════════════════════════════════════════════════\n",
);
console.log("📖 Дополнительная информация:\n");
console.log("  • GraphQL Multipart Request Spec:");
console.log(
  "    https://github.com/jaydenseric/graphql-multipart-request-spec",
);
console.log("");
console.log("  • Saleor GraphQL API - Product Media:");
console.log(
  "    https://docs.saleor.io/api-reference/products/mutations/product-media-create",
);
console.log("");
console.log("  • FormData (npm package):");
console.log("    https://www.npmjs.com/package/form-data");
console.log("\n");
