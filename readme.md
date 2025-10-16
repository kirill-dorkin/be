# Nimara E-commerce — полная документация

## Содержание
- [1. Архитектура монорепозитория](#1-архитектура-монорепозитория)
- [2. Приложения](#2-приложения)
  - [2.1 Storefront](#21-storefront)
  - [2.2 Платёжное приложение Stripe](#22-платёжное-приложение-stripe)
  - [2.3 Документационный портал](#23-документационный-портал)
  - [2.4 Набор автоматизированных тестов](#24-набор-автоматизированных-тестов)
- [3. Общие пакеты и инфраструктура](#3-общие-пакеты-и-инфраструктура)
- [4. Данные и вспомогательные инструменты](#4-данные-и-вспомогательные-инструменты)
- [5. Запуск и развёртывание](#5-запуск-и-развёртывание)
- [6. Наблюдаемость и качество](#6-наблюдаемость-и-качество)

## 1. Архитектура монорепозитория
- Репозиторий управляется `pnpm` и `turbo`, требует Node.js 22–24 и содержит универсальные скрипты сборки, разработки, тестирования и форматирования для всех пакетов.【F:package.json†L1-L49】【F:turbo.json†L1-L74】
- Пространство рабочих пакетов включает каталоги `apps/*` и `packages/*`, поэтому любую новую службу или библиотеку следует добавлять в соответствующую область.【F:pnpm-workspace.yaml†L1-L3】
- Глобальные переменные окружения пробрасываются через Turbo (Sentry, Stripe, Saleor и т.д.), что упрощает конфигурацию в CI/CD и локальной разработке.【F:turbo.json†L1-L74】

## 2. Приложения

### 2.1 Storefront
Storefront — основное клиентское приложение на Next.js 15 с React 19, Tailwind CSS, next-intl, NextAuth, Sentry и Vercel Speed Insights.【F:apps/storefront/package.json†L1-L88】 Ниже перечислены ключевые возможности:

- **Мультирегиональность и локализация.** Настройка рынков включает сопоставление локали, канала Saleor, валюты и языка, что позволяет быстро добавлять новые регионы.【F:apps/storefront/src/regions/config.ts†L1-L91】【F:packages/domain/src/consts.ts†L259-L292】
- **Управление кешем и пользовательскими предпочтениями.** Конфигурация определяет TTL для PDP, корзины и CMS, а также ключи/сроки действия куки (checkout, locale, currency) и базовые параметры витрины.【F:apps/storefront/src/config.ts†L1-L38】 Дополнительные API позволяют удалять куки и корректно перенаправлять пользователя после выхода, сохраняя выбранный рынок.【F:apps/storefront/src/app/api/cookies/delete/route.ts†L1-L11】【F:apps/storefront/src/app/api/logout/route.ts†L1-L19】
- **Гибкие CMS-провайдеры.** Витрина динамически выбирает источник контента: Saleor CMS или ButterCMS, автоматически логируя переход на fallback при отсутствии ключа и подгружая соответствующие сервисы лениво.【F:apps/storefront/src/services/cms.ts†L1-L81】
- **Поиск и фасеты.** Реализованы провайдеры Saleor и Algolia с единым интерфейсом: конфигурация сортировок/фильтров, учёт виртуальных реплик и ленивое подключение выбранного движка по переменной окружения.【F:apps/storefront/src/services/search.ts†L1-L183】
- **Каталог и PDP.** StoreService агрегирует запросы к Saleor (базовые сведения, варианты, наличие, рекомендации) и переиспользуется страницами PDP через ленивую инициализацию。【F:apps/storefront/src/services/store.ts†L1-L29】【F:packages/infrastructure/src/store/types.ts†L1-L69】
- **Корзина и оформление заказа.** Отдельные сервисы инкапсулируют операции создания/обновления корзины, работы с промокодами, адресами и заказами, полагаясь на общий слой инфраструктуры.【F:apps/storefront/src/services/cart.ts†L1-L29】【F:packages/infrastructure/src/cart/types.ts†L1-L87】【F:apps/storefront/src/services/checkout.ts†L1-L29】【F:packages/infrastructure/src/checkout/types.ts†L1-L100】
- **Аутентификация и кабинет пользователя.** NextAuth с провайдером учетных данных Saleor, управление токенами в cookies и полный набор юзкейсов аккаунта (адреса, заказы, изменение почты/пароля, удаление учётки).【F:apps/storefront/src/auth.ts†L1-L73】【F:packages/infrastructure/src/user/types.ts†L1-L170】
- **Платежи.** Платёжный сервис включается только при корректной конфигурации Stripe и пробрасывает ключи, идентификатор приложения и окружение в Saleor gateway.【F:apps/storefront/src/services/payment.ts†L1-L48】
- **Сервисный центр и кастомные услуги.** Страница `/services` выводит каталог ремонтных услуг, использует расчёт стоимости и форму запроса, локализует валюту и строки.【F:apps/storefront/src/app/[locale]/(main)/services/page.tsx†L1-L101】 Каталог описан в одном файле и поддерживает типы устройств, диапазоны цен и теги, что упрощает сопровождение.【F:apps/storefront/src/lib/repair-services/data.ts†L1-L187】
- **Интеграция заявок с Saleor.** API `/api/service-request` валидирует payload, проверяет услугу, создаёт черновой заказ в Saleor, назначает доступного работника, шлёт вебхук и возвращает подробности назначения.【F:apps/storefront/src/app/api/service-request/route.ts†L1-L203】【F:apps/storefront/src/services/service-request.ts†L1-L29】【F:packages/infrastructure/src/service-request/types.ts†L1-L72】
- **Каталоги для интеграций.** Доступны эндпоинты `/api/repair-services` и `/api/repair-services/seed`, а также руководства по импорту каталога и настройке рабочих групп в Saleor Dashboard.【F:apps/storefront/src/app/api/repair-services/route.ts†L1-L13】【F:apps/storefront/src/app/api/repair-services/seed/route.ts†L1-L30】【F:docs/repair-services.md†L1-L56】
- **Вебхуки и кеш.** Обработчики Saleor (продукты, страницы, коллекции, меню, категории) сбрасывают теги кеша и при необходимости дотягивают дополнительную информацию, чтобы storefront мгновенно обновлялся.【F:apps/storefront/src/app/api/webhooks/saleor/products/route.ts†L1-L62】【F:apps/storefront/src/lib/cache.ts†L1-L4】
- **Логирование и наблюдаемость.** Логгер построен на pino, конфигурируется через переменные окружения и переиспользуется лениво в сервисах; зависимость на Sentry, OTEL и Speed Insights доступна из единого `package.json`.【F:apps/storefront/src/services/logging.ts†L1-L3】【F:apps/storefront/src/services/lazy-logging.ts†L1-L19】【F:packages/infrastructure/src/logging/service.ts†L1-L45】【F:apps/storefront/package.json†L17-L48】

### 2.2 Платёжное приложение Stripe
Отдельное Next.js-приложение разворачивается на Vercel и содержит UI для настройки Saleor-платежей через Stripe, включая витринные формы, вебхуки и автоматическую установку манифеста.【F:apps/stripe/package.json†L1-L70】【F:apps/stripe/README.md†L1-L72】 Руководство описывает необходимые токены Vercel/Stripe, порядок установки и связь со storefront через `NEXT_PUBLIC_PAYMENT_APP_ID`.【F:apps/stripe/README.md†L15-L57】

### 2.3 Документационный портал
В репозитории присутствует сайт документации на Next.js + Nextra, который генерирует статический поиск Pagefind и содержит пошаговые гайды (запуск storefront, переменные окружения, webhooks, деплой на Vercel).【F:apps/docs/package.json†L1-L27】【F:apps/docs/app/page.mdx†L1-L8】【F:apps/docs/app/quickstart/storefront/page.mdx†L1-L155】

### 2.4 Набор автоматизированных тестов
Папка `apps/automated-tests` содержит Playwright-проект с общими линтинговыми настройками и скриптом `test:e2e`, что позволяет запускать регрессию против развернутой витрины или предпросмотров.【F:apps/automated-tests/package.json†L1-L28】

## 3. Общие пакеты и инфраструктура
- **Доменная модель (`@nimara/domain`).** Описывает допустимые страны, локали и валюты, используемые во всех сервисах и UI, а также типы бизнес-объектов (адреса, продукты, заказы и т.д.).【F:packages/domain/src/consts.ts†L1-L292】
- **Инфраструктурный слой (`@nimara/infrastructure`).** Предоставляет:
  - Типизированный GraphQL-клиент с контролем кеширования, логированием ошибок и унифицированными `AsyncResult`-ответами.【F:packages/infrastructure/src/graphql/client.ts†L1-L200】
  - Конфигурацию изображений/SSR и общие константы для фронтенда.【F:packages/infrastructure/src/config.ts†L1-L10】
  - Сервисы каталога, корзины, чекаута, пользователей, адресов, поиска, платежей и заявок, каждый со строгими типами запросов/ответов и инжектируемым логгером.【F:packages/infrastructure/src/store/types.ts†L1-L69】【F:packages/infrastructure/src/cart/types.ts†L1-L87】【F:packages/infrastructure/src/checkout/types.ts†L1-L100】【F:packages/infrastructure/src/user/types.ts†L1-L170】【F:packages/infrastructure/src/address/types.ts†L1-L52】【F:packages/infrastructure/src/service-request/types.ts†L1-L72】
  - Сервис фулфилмента, который оборачивает use-case возврата товаров через Saleor API.【F:packages/infrastructure/src/fulfillment/service.ts†L1-L15】
  - Общий логгер на базе pino с возможностью создавать именованные инстансы.【F:packages/infrastructure/src/logging/service.ts†L1-L45】
- **UI-библиотека (`@nimara/ui`).** Содержит набор Tailwind-компонентов (кнопки, формы, навигация, Skeletons), поддерживает слоты и состояния загрузки, что обеспечивает единый стиль во всех приложениях.【F:packages/ui/src/components/button.tsx†L1-L86】
- **Конфигурации (`@nimara/config`).** Общий Tailwind-конфиг со скринами, палитрой и утилитами, плюс PostCSS с автопрефиксером для согласованной стилизации между приложениями.【F:packages/config/src/tailwind.config.ts†L1-L130】【F:packages/config/src/postcss.config.js†L1-L9】
- **Генерация схемы (`@nimara/codegen`).** Настраивает GraphQL Code Generator: строгие типы, scalar mapping, near-operation пресет и контроль обязательности полей, основанный на Saleor API URL из окружения.【F:packages/codegen/codegen.ts†L1-L69】

## 4. Данные и вспомогательные инструменты
- **Каталог ремонтных услуг.** Единый источник правды в `data.ts` описывает устройства, группы, цены (фиксированные, диапазон, «от») и используется как в UI, так и при подготовке данных для Saleor.【F:apps/storefront/src/lib/repair-services/data.ts†L1-L187】 Документация объясняет, как импортировать эти услуги в Saleor и управлять рабочими группами.【F:docs/repair-services.md†L1-L56】
- **Скрипты синхронизации Saleor.** `scripts/saleor_sync_catalog.js` читает подготовленный каталог, выполняет GraphQL-запросы с повторными попытками, пакетирует операции и удаляет устаревшие сущности, что позволяет поддерживать демо-данные в актуальном состоянии.【F:scripts/saleor_sync_catalog.js†L1-L198】
- **Terraform для Vercel.** Модули `terraform/storefront` создают проект Next.js, настраивают ветки/домены и автоматически разносят переменные окружения по таргетам (Production/Preview/Development).【F:terraform/storefront/main.tf†L1-L13】【F:terraform/storefront/resources.tf†L1-L59】

## 5. Запуск и развёртывание
- Базовые команды доступны в корневом `package.json`: `pnpm run dev`, `build`, `test`, `format` и специализированные фильтры для отдельных приложений.【F:package.json†L19-L37】
- Документация предлагает пошаговый quickstart: клонирование, установка зависимостей, настройка `.env`, запуск dev-сервера, а также инструкцию по настройке Saleor webhooks и деплой на Vercel (с указанием Node.js ≥22).【F:apps/docs/app/quickstart/storefront/page.mdx†L1-L155】
- Переменные окружения разделены на клиентские и серверные: выбор CMS/поиска, ключи Stripe, каналы Saleor, URL витрины и т.д.; серверная часть валидирует токен приложения и параметры сервисного канала/группы работников.【F:apps/storefront/src/envs/client.ts†L1-L67】【F:apps/storefront/src/envs/server.ts†L1-L24】

## 6. Наблюдаемость и качество
- Все сервисы используют единый логгер с уровнями, управляемыми переменной `LOG_LEVEL`, а в storefront предусмотрена ленивое создание экземпляра, чтобы не тянуть зависимости в клиенский бандл без необходимости.【F:packages/infrastructure/src/logging/service.ts†L1-L45】【F:apps/storefront/src/services/lazy-logging.ts†L1-L19】
- В storefront и Stripe включены Sentry, OpenTelemetry и другие наблюдательные зависимости, что упрощает мониторинг производительности и ошибок.【F:apps/storefront/package.json†L17-L48】【F:apps/stripe/package.json†L16-L37】
- Playwright-пакет позволяет запускать e2e-тесты (`pnpm run test:e2e`) и использовать единые линтинговые правила перед коммитами.【F:apps/automated-tests/package.json†L5-L23】

Эта документация охватывает все основные возможности и взаимосвязи внутри монорепозитория Nimara, обеспечивая быстрое погружение в проект и упрощая дальнейшее развитие.
