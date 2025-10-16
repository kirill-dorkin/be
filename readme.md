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
- **Сервисный центр.** Страница [`src/app/[locale]/(main)/services/page.tsx`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/app/%5Blocale%5D/(main)/services/page.tsx) отображает каталог услуг, валюту и форму заявки. Источник данных — [`src/lib/repair-services/data.ts`](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/lib/repair-services/data.ts).
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
=======
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