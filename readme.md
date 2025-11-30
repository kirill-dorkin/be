# Nimara E-commerce — подробная документация

Эта документация предназначена для разработчиков и команд поддержки, которым нужно быстро разобраться в монорепозитории [kirill-dorkin/be](https://github.com/kirill-dorkin/be). Ниже описаны архитектура, приложения, общие пакеты, процессы автоматизации и практические рекомендации по запуску и сопровождению решений Nimara.

## Содержание

- [1. Архитектура и структура монорепозитория](#1-архитектура-и-структура-монорепозитория)
  - [1.1 Инструменты и управление зависимостями](#11-инструменты-и-управление-зависимостями)
  - [1.2 Основные директории](#12-основные-директории)
- [2. Приложения](#2-приложения)
  - [2.1 Storefront (Next.js 15)](#21-storefront-nextjs-15)
  - [2.2 Платёжное приложение Stripe](#22-платёжное-приложение-stripe)
  - [2.3 Документационный портал](#23-документационный-портал)
  - [2.4 Набор автоматизированных тестов](#24-набор-автоматизированных-тестов)
- [3. Общие пакеты](#3-общие-пакеты)
- [4. Данные, скрипты и интеграции](#4-данные-скрипты-и-интеграции)
- [5. Локальная разработка](#5-локальная-разработка)
  - [5.1 Требования и установка](#51-требования-и-установка)
  - [5.2 Настройка переменных окружения](#52-настройка-переменных-окружения)
  - [5.3 Запуск и тестирование](#53-запуск-и-тестирование)
- [6. Развёртывание и инфраструктура](#6-развёртывание-и-инфраструктура)
- [7. Наблюдаемость, качество и соглашения](#7-наблюдаемость-качество-и-соглашения)
- [8. Полезные материалы](#8-полезные-материалы)

---

## 1. Архитектура и структура монорепозитория

Монорепозиторий построен вокруг `pnpm` и `turborepo`, что обеспечивает единый процесс разработки, сборки и деплоя для всех сервисов. Используется Node.js 22+, а релизы тестируются на версии 24.

### 1.1 Инструменты и управление зависимостями

- Корневой `package.json` описывает общие скрипты (`dev`, `build`, `test`, `format`, фильтры для приложений) и задаёт единые версии инструментов. Посмотреть полный список можно в [package.json](https://github.com/kirill-dorkin/be/blob/main/package.json).
- Конфигурация turborepo хранится в [turbo.json](https://github.com/kirill-dorkin/be/blob/main/turbo.json); здесь описаны пайплайны сборки, кэширование и проброс переменных окружения (Stripe, Sentry, Saleor, ButterCMS и др.).
- Рабочие пространства определяются в [pnpm-workspace.yaml](https://github.com/kirill-dorkin/be/blob/main/pnpm-workspace.yaml) и охватывают каталоги `apps/*` и `packages/*`, что упрощает добавление новых приложений или библиотек.

### 1.2 Основные директории

- [`apps`](https://github.com/kirill-dorkin/be/tree/main/apps) — конечные приложения (витрина, платежи, документация, тесты).
- [`packages`](https://github.com/kirill-dorkin/be/tree/main/packages) — общие доменные модели, инфраструктурные сервисы, UI-компоненты и конфигурации.
- [`docs`](https://github.com/kirill-dorkin/be/tree/main/docs) — дополнительные руководства, например инструкция по сервисному центру.
- [`scripts`](https://github.com/kirill-dorkin/be/tree/main/scripts) — автоматизация для Saleor и вспомогательных задач.
- [`terraform`](https://github.com/kirill-dorkin/be/tree/main/terraform) — инфраструктурный код для Vercel и связанных ресурсов.
- Файлы `catalog_curated.json`, `saleor_catalog.json`, `price.json` и сопутствующие таблицы — подготовленные данные для импорта в Saleor и расчёта услуг.

---

## 2. Приложения

### 2.1 Storefront (Next.js 15)

[`apps/storefront`](https://github.com/kirill-dorkin/be/tree/main/apps/storefront) — основная витрина на Next.js 15 (App Router) и React 19. В `package.json` задекларированы ключевые зависимости: Tailwind CSS, next-intl, NextAuth, Stripe, Sentry, OpenTelemetry и Vercel Speed Insights ([посмотреть файл](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/package.json)).

Ключевые возможности:

- **Мультирегиональность.** Конфигурация рынков и локалей описана в [`src/regions/config.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/regions/config.ts) и повторно используется доменными константами из [`packages/domain/src/consts.ts`](https://github.com/kirill-dorkin/be/blob/main/packages/domain/src/consts.ts).
- **Гибкая настройка витрины.** Базовые параметры (таймауты кеша, настройки куки, URL CMS) определены в [`src/config.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/config.ts). Удаление cookies и корректный logout реализованы через API-роуты [`api/cookies/delete`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/app/api/cookies/delete/route.ts) и [`api/logout`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/app/api/logout/route.ts).
- **Поддержка нескольких CMS.** Сервис [`src/services/cms.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/cms.ts) автоматически выбирает провайдера (Saleor CMS или ButterCMS) на основе окружения и логирует fallback.
- **Поиск и фасеты.** [`src/services/search.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/search.ts) содержит адаптеры для Saleor и Algolia с конфигурацией сортировок, фильтров и виртуальных реплик.
- **Каталог и PDP.** Сервис [`src/services/store.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/store.ts) агрегирует данные о продуктах, а типы описаны в [`packages/infrastructure/src/store/types.ts`](https://github.com/kirill-dorkin/be/blob/main/packages/infrastructure/src/store/types.ts).
- **Корзина и оформление заказа.** Инкапсулированы в [`src/services/cart.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/cart.ts) и [`src/services/checkout.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/checkout.ts); типы данных хранятся в [`packages/infrastructure/src/cart/types.ts`](https://github.com/kirill-dorkin/be/blob/main/packages/infrastructure/src/cart/types.ts) и [`packages/infrastructure/src/checkout/types.ts`](https://github.com/kirill-dorkin/be/blob/main/packages/infrastructure/src/checkout/types.ts).
- **Аутентификация.** Конфигурация NextAuth и работа с Saleor токенами находятся в [`src/auth.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/auth.ts); доменные типы пользователя — в [`packages/infrastructure/src/user/types.ts`](https://github.com/kirill-dorkin/be/blob/main/packages/infrastructure/src/user/types.ts).
- **Платежи и Stripe.** Сервис [`src/services/payment.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/payment.ts) подключает платёжное приложение и пробрасывает ключи в Saleor.
- **Сервисный центр.** Страница [`src/app/[locale]/(main)/services/page.tsx`](<https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/app/%5Blocale%5D/(main)/services/page.tsx>) отображает каталог услуг, валюту и форму заявки. Источник данных — [`src/lib/repair-services/data.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/lib/repair-services/data.ts).
- **Интеграция заявок.** Обработка новых запросов реализована в [`src/app/api/service-request/route.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/app/api/service-request/route.ts) и опирается на общий сервис [`src/services/service-request.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/service-request.ts).
- **Вебхуки и кеш.** Обработчики Saleor (например, [`api/webhooks/saleor/products`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/app/api/webhooks/saleor/products/route.ts)) сбрасывают теги кеша через [`src/lib/cache.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/lib/cache.ts).
- **Логирование.** [`src/services/logging.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/logging.ts) и [`src/services/lazy-logging.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/lazy-logging.ts) предоставляют ленивое подключение pino-логгера, реализованного в инфраструктурном пакете.

### 2.2 Платёжное приложение Stripe

Приложение [`apps/stripe`](https://github.com/kirill-dorkin/be/tree/main/apps/stripe) разворачивается на Vercel и обеспечивает UI для настройки Saleor-платежей через Stripe. Подробности зависимостей и скриптов — в [package.json](https://github.com/kirill-dorkin/be/blob/main/apps/stripe/package.json). Руководство по установке, настройке токенов и интеграции со storefront находится в [apps/stripe/README.md](https://github.com/kirill-dorkin/be/blob/main/apps/stripe/README.md).

### 2.3 Документационный портал

Сайт документации в [`apps/docs`](https://github.com/kirill-dorkin/be/tree/main/apps/docs) построен на Next.js и Nextra. Главная страница и структура разделов описаны в [app/page.mdx](https://github.com/kirill-dorkin/be/blob/main/apps/docs/app/page.mdx), а пошаговый гид по запуску витрины — в [app/quickstart/storefront/page.mdx](https://github.com/kirill-dorkin/be/blob/main/apps/docs/app/quickstart/storefront/page.mdx). Статический поиск обеспечивает Pagefind.

### 2.4 Набор автоматизированных тестов

В [`apps/automated-tests`](https://github.com/kirill-dorkin/be/tree/main/apps/automated-tests) расположен Playwright-проект. Скрипты запуска и настройки линтинга описаны в [package.json](https://github.com/kirill-dorkin/be/blob/main/apps/automated-tests/package.json), что позволяет проверять витрину как в production, так и на предпросмотрах.

---

## 3. Общие пакеты

- **`@nimara/domain`** ([packages/domain](https://github.com/kirill-dorkin/be/tree/main/packages/domain)) — доменные константы (страны, валюты, локали) и типы бизнес-объектов для всех сервисов.
- **`@nimara/infrastructure`** ([packages/infrastructure](https://github.com/kirill-dorkin/be/tree/main/packages/infrastructure)) — типизированный GraphQL-клиент ([graphql/client.ts](https://github.com/kirill-dorkin/be/blob/main/packages/infrastructure/src/graphql/client.ts)), сервисы каталога, корзины, чекаута, платежей, пользователей и заявок, а также общий pino-логгер ([logging/service.ts](https://github.com/kirill-dorkin/be/blob/main/packages/infrastructure/src/logging/service.ts)).
- **`@nimara/ui`** ([packages/ui](https://github.com/kirill-dorkin/be/tree/main/packages/ui)) — библиотека UI-компонентов на Tailwind (например, [components/button.tsx](https://github.com/kirill-dorkin/be/blob/main/packages/ui/src/components/button.tsx)), поддерживающая состояния загрузки и слоты.
- **`@nimara/config`** ([packages/config](https://github.com/kirill-dorkin/be/tree/main/packages/config)) — общие конфигурации Tailwind ([tailwind.config.ts](https://github.com/kirill-dorkin/be/blob/main/packages/config/src/tailwind.config.ts)) и PostCSS ([postcss.config.js](https://github.com/kirill-dorkin/be/blob/main/packages/config/src/postcss.config.js)).
- **`@nimara/codegen`** ([packages/codegen](https://github.com/kirill-dorkin/be/tree/main/packages/codegen)) — GraphQL Code Generator с пресетом near-operation и строгой типизацией ([codegen.ts](https://github.com/kirill-dorkin/be/blob/main/packages/codegen/codegen.ts)).

---

## 4. Данные, скрипты и интеграции

- **Каталог ремонтных услуг.** Главный источник — [`apps/storefront/src/lib/repair-services/data.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/lib/repair-services/data.ts). Подробная инструкция по импорту и настройке рабочих групп опубликована в [docs/repair-services.md](https://github.com/kirill-dorkin/be/blob/main/docs/repair-services.md).
- **Импорт каталога в Saleor.** Скрипт [`scripts/saleor_sync_catalog.js`](https://github.com/kirill-dorkin/be/blob/main/scripts/saleor_sync_catalog.js) читает подготовленные JSON-файлы, отправляет GraphQL-запросы пачками, повторяет попытки и синхронизирует витрину.
- **Файлы данных.** `catalog_curated.json`, `saleor_catalog.json`, `price.json` и таблица `price.xls` используются для подготовки прайс-листов, расчёта стоимости услуг и загрузки данных в Saleor.
- **Сервисные API.** Витрина предоставляет REST-эндпоинты [`api/repair-services`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/app/api/repair-services/route.ts) и [`api/repair-services/seed`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/app/api/repair-services/seed/route.ts) для интеграции с внешними системами.

---

## 5. Локальная разработка

### 5.1 Требования и установка

1. Установите Node.js версии 22 или 24 и pnpm.
2. Клонируйте репозиторий и выполните установку зависимостей:
   ```bash
   pnpm install
   ```
3. Ознакомьтесь с общими скриптами в [package.json](https://github.com/kirill-dorkin/be/blob/main/package.json) и при необходимости настройте `corepack`.

### 5.2 Настройка переменных окружения

- Витрина использует разделение переменных на клиентские ([envs/client.ts](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/envs/client.ts)) и серверные ([envs/server.ts](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/envs/server.ts)). Настройте Stripe, Saleor, ButterCMS, Algolia, Sentry и собственные домены.
- Платёжное приложение и документация также читают переменные окружения, описанные в их README и `package.json`.

### 5.3 Запуск и тестирование

- Запуск витрины и вспомогательных сервисов:
  ```bash
  pnpm dev
  ```
- Сборка production-версий:
  ```bash
  pnpm build
  ```
- Запуск линтеров и форматирования:
  ```bash
  pnpm lint
  pnpm format
  ```
- End-to-end тесты Playwright:
  ```bash
  pnpm --filter automated-tests test:e2e
  ```

---

## 6. Развёртывание и инфраструктура

- Terraform-модули в [`terraform/storefront`](https://github.com/kirill-dorkin/be/tree/main/terraform/storefront) создают проект Vercel, настраивают ветки, домены и распределяют переменные окружения по таргетам (Production/Preview/Development). Основные ресурсы описаны в [main.tf](https://github.com/kirill-dorkin/be/blob/main/terraform/storefront/main.tf) и [resources.tf](https://github.com/kirill-dorkin/be/blob/main/terraform/storefront/resources.tf).
- Платёжное приложение и документация публикуются на Vercel вручную либо через CI, используя те же переменные окружения, что и витрина.
- Для интеграции со Stripe необходимо указать `NEXT_PUBLIC_PAYMENT_APP_ID` и секреты, описанные в [apps/stripe/README.md](https://github.com/kirill-dorkin/be/blob/main/apps/stripe/README.md).

---

## 7. Наблюдаемость, качество и соглашения

- Логирование во всех сервисах реализовано через pino, общий сервис расположен в [packages/infrastructure/src/logging/service.ts](https://github.com/kirill-dorkin/be/blob/main/packages/infrastructure/src/logging/service.ts). Для storefront доступна ленивое подключение ([services/lazy-logging.ts](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/lazy-logging.ts)).
- Sentry, OpenTelemetry и другие инструменты наблюдаемости подключены в vitrine и Stripe через соответствующие зависимости `package.json`.
- Рекомендации по контрибьютингу и код-ревью описаны в [CONTRIBUTING.md](https://github.com/kirill-dorkin/be/blob/main/CONTRIBUTING.md).
- Кодекс поведения команды опубликован в [CODE_OF_CONDUCT.md](https://github.com/kirill-dorkin/be/blob/main/CODE_OF_CONDUCT.md).

---

## 8. Полезные материалы

- Руководство по ремонтным услугам и настройке заявок: [docs/repair-services.md](https://github.com/kirill-dorkin/be/blob/main/docs/repair-services.md).
- Лицензионные условия: [LICENSE](https://github.com/kirill-dorkin/be/blob/main/LICENSE).
- Дополнительные цены и каталоги: [catalog_curated.json](https://github.com/kirill-dorkin/be/blob/main/catalog_curated.json), [saleor_catalog.json](https://github.com/kirill-dorkin/be/blob/main/saleor_catalog.json), [price.json](https://github.com/kirill-dorkin/be/blob/main/price.json).

Документация регулярно обновляется по мере эволюции продукта. Если вы заметили неточность или хотите добавить информацию, создайте pull request согласно рекомендациям из [CONTRIBUTING.md](https://github.com/kirill-dorkin/be/blob/main/CONTRIBUTING.md).
