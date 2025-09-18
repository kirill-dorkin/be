# Полная структура проекта

## Обзор
Это детальная документация всех файлов и папок в проекте Next.js с интернационализацией, аутентификацией и e-commerce функциональностью.

## Корневые файлы

### Конфигурационные файлы
- **.eslintrc.json** - Конфигурация ESLint для проверки качества кода
- **.gitignore** - Список файлов и папок, игнорируемых Git
- **.stylelintrc.json** - Конфигурация Stylelint для проверки CSS стилей
- **components.json** - Конфигурация shadcn/ui компонентов
- **next.config.ts** - Конфигурация Next.js приложения
- **package.json** - Зависимости и скрипты проекта
- **package-lock.json** - Точные версии установленных пакетов (npm)
- **pnpm-lock.yaml** - Точные версии установленных пакетов (pnpm)
- **bun.lock** - Точные версии установленных пакетов (bun)
- **postcss.config.mjs** - Конфигурация PostCSS для обработки CSS
- **tailwind.config.ts** - Конфигурация Tailwind CSS
- **tsconfig.json** - Конфигурация TypeScript
- **netlify.toml** - Конфигурация для деплоя на Netlify

### Документация
- **README.md** - Основная документация проекта (русский)
- **README_EN.md** - Основная документация проекта (английский)
- **PROJECT_ARCHITECTURE_SCHEMA.md** - Схема архитектуры проекта
- **LOCALIZATION_GUIDE.md** - Руководство по локализации
- **TESTING_LOCALIZATION.md** - Тестирование локализации
- **TRANSLATION_MAINTENANCE.md** - Поддержка переводов

### Вспомогательные файлы
- **alignment-test.html** - Тестовый файл для проверки выравнивания
- **missing_keys_analysis.txt** - Анализ отсутствующих ключей переводов
- **test-imports.ts** - Тестирование импортов

## Структура папок

### /docs/
Дополнительная документация проекта
- **PROJECT_OVERVIEW_RU.md** - Обзор проекта на русском языке

### /messages/
Файлы переводов (корневая папка для совместимости)

### /public/
Статические ресурсы, доступные публично

#### /public/icons/
Иконки приложения для PWA
- **icon-48x48.svg** - Иконка 48x48 пикселей
- **icon-96x96.svg** - Иконка 96x96 пикселей
- **icon-144x144.svg** - Иконка 144x144 пикселей
- **icon-192x192.svg** - Иконка 192x192 пикселей

#### /public/images/
Изображения для контента
- **laptop-store.jpg** - Изображение магазина ноутбуков
- **asus-rog-g15.jpg** - Изображение ноутбука ASUS ROG G15
- **dell-xps-13.jpg** - Изображение ноутбука Dell XPS 13
- **hp-pavilion-15.jpg** - Изображение ноутбука HP Pavilion 15
- **lenovo-legion-5.jpg** - Изображение ноутбука Lenovo Legion 5
- **macbook-pro-14.jpg** - Изображение MacBook Pro 14
- **thinkpad-x1.jpg** - Изображение ThinkPad X1
- **tablets-lined-up-display-shopping-mall.jpg** - Изображение планшетов в торговом центре
- **bulan-bali.jpg** - Изображение Бали
- **rice-terrace-1.jpeg** - Рисовые террасы
- **tegalalang-rice-terraces-morning-slider.jpg** - Рисовые террасы утром
- **tranquil-haven.jpg** - Спокойная гавань
- **ubud-rice-terrace.jpg** - Рисовые террасы Убуд

#### Другие файлы в /public/
- **manifest.json** - Манифест PWA приложения
- **sw.js** - Service Worker для PWA
- **file.svg**, **globe.svg**, **next.svg**, **vercel.svg**, **window.svg** - SVG иконки

### /scripts/
Скрипты для настройки и наполнения базы данных
- **seed-products.js** - Скрипт для заполнения базы данных продуктами
- **setup-database.ts** - Скрипт настройки базы данных

### /src/
Основной исходный код приложения

#### /src/actions/
Server Actions для Next.js
- **/dashboard/** - Действия для панели управления

#### /src/app/
App Router Next.js - основная структура приложения

##### /src/app/[locale]/
Локализованные страницы приложения

##### /src/app/admin/
Административная панель

##### /src/app/api/
API маршруты Next.js
- Содержит подпапки для различных API endpoints:
  - admin/, auth/, cart/, categories/, dashboard/, devices/, favorites/, orders/, products/, services/, tasks/, users/

##### Корневые файлы /src/app/
- **layout.tsx** - Корневой layout компонент
- **globals.css** - Глобальные CSS стили
- **reset.css** - CSS reset стили
- **providers.tsx** - Провайдеры контекста
- **not-found.tsx** - Страница 404
- **favicon.ico** - Иконка сайта

##### /src/app/fonts/
Шрифты приложения

##### /src/app/test-page/
Тестовые страницы

#### /src/auth.ts
Конфигурация NextAuth.js

#### /src/components/
React компоненты

##### Основные компоненты
- **AvatarMenu.tsx** - Меню аватара пользователя
- **BaseContainer.tsx** - Базовый контейнер
- **ButtonsWrapper.tsx** - Обертка для кнопок
- **CartDropdown.tsx** - Выпадающее меню корзины
- **CartIcon.tsx** - Иконка корзины
- **ClientHeader.tsx** - Клиентский заголовок
- **ClientLayout.tsx** - Клиентский layout
- **FavoritesDropdown.tsx** - Выпадающее меню избранного
- **FavoritesDropdownWrapper.tsx** - Обертка для избранного
- **FavoritesSheet.tsx** - Боковая панель избранного
- **Footer.tsx** - Подвал сайта
- **InputFormField.tsx** - Поле ввода формы
- **LanguageSwitcher.tsx** - Переключатель языков
- **LazyComponents.tsx** - Ленивая загрузка компонентов
- **LoadingScreen.tsx** - Экран загрузки
- **LocalizedExample.tsx** - Пример локализации
- **PhoneInputField.tsx** - Поле ввода телефона
- **RequestForm.tsx** - Форма запроса

##### Специализированные папки компонентов
- **/admin/** - Компоненты административной панели
- **/analytics/** - Компоненты аналитики
- **/charts/** - Компоненты графиков
- **/dashboard/** - Компоненты панели управления
- **/home/** - Компоненты главной страницы
- **/launchui/** - UI компоненты запуска
- **/pwa/** - PWA компоненты
- **/shop/** - Компоненты магазина
- **/ui/** - Базовые UI компоненты (shadcn/ui)

#### /src/handlers/
Обработчики бизнес-логики
- **taskHandlers.ts** - Обработчики задач
- **userHandlers.ts** - Обработчики пользователей

#### /src/hooks/
Пользовательские React хуки
- **use-toast.ts** - Хук для уведомлений
- **useAnalytics.ts** - Хук аналитики
- **useAppContext.ts** - Хук контекста приложения
- **useCallbackUrl.ts** - Хук callback URL
- **useCart.ts** - Хук корзины
- **useClientComponent.ts** - Хук клиентского компонента
- **useCustomToast.ts** - Хук кастомных уведомлений
- **useDashboardCache.ts** - Хук кэша панели управления
- **useDashboardPrefetch.ts** - Хук предзагрузки панели управления
- **useFavorites.ts** - Хук избранного
- **useGeoCountry.ts** - Хук геолокации страны
- **useLocalStorage.ts** - Хук локального хранилища
- **useMetrics.ts** - Хук метрик
- **usePWA.ts** - Хук PWA функциональности
- **usePrefetch.ts** - Хук предзагрузки
- **useTasks.ts** - Хук задач
- **useUsers.ts** - Хук пользователей

#### /src/i18n.ts
Конфигурация интернационализации

#### /src/lib/
Вспомогательные библиотеки и утилиты

##### Основные файлы
- **auth.ts** - Утилиты аутентификации
- **createIndexes.ts** - Создание индексов базы данных
- **dbConnect.ts** - Подключение к базе данных
- **dbUtils.ts** - Утилиты базы данных
- **initAdmin.ts** - Инициализация администратора
- **locales.ts** - Конфигурация локалей
- **mongodb.ts** - Конфигурация MongoDB
- **optimizedDb.ts** - Оптимизированные запросы к БД
- **router.ts** - Утилиты маршрутизации
- **utils.ts** - Общие утилиты

##### /src/lib/i18n/
Библиотеки интернационализации

##### /src/lib/redis/
Библиотеки Redis
- **cache.ts** - Кэширование
- **index.ts** - Основной файл Redis

#### /src/messages/
Файлы переводов
- **en.json** - Английские переводы
- **en.json.backup** - Резервная копия английских переводов
- **kg.json** - Киргизские переводы
- **ru.json** - Русские переводы

#### /src/middleware.ts
Middleware Next.js для обработки запросов

#### /src/models/
Модели данных MongoDB
- **Cart.ts** - Модель корзины
- **Category.ts** - Модель категории
- **Device.ts** - Модель устройства
- **Favorite.ts** - Модель избранного
- **Order.ts** - Модель заказа
- **Product.ts** - Модель продукта
- **Role.ts** - Модель роли
- **Service.ts** - Модель услуги
- **Task.ts** - Модель задачи
- **User.ts** - Модель пользователя

#### /src/providers/
Провайдеры контекста React
- **AppProvider.tsx** - Основной провайдер приложения

#### /src/schemas/
Схемы валидации данных
- **DeviceSchema.ts** - Схема устройства
- **ServiceSchema.ts** - Схема услуги
- **TaskSchema.ts** - Схема задачи

#### /src/scripts/
Вспомогательные скрипты
- **addLaptops.ts** - Скрипт добавления ноутбуков

#### /src/services/
Сервисы для работы с API
- **analyticsApi.ts** - API аналитики
- **index.ts** - Основной файл сервисов
- **taskService.ts** - Сервис задач

#### /src/styles/
Дополнительные стили
- **analytics.css** - Стили для аналитики

#### /src/types/
Определения типов TypeScript
- **AppContextTypes.ts** - Типы контекста приложения
- **bcryptjs.d.ts** - Типы для bcryptjs
- **index.ts** - Основные типы
- **nextauth.d.ts** - Типы для NextAuth

## Технологический стек

### Frontend
- **Next.js 14** - React фреймворк с App Router
- **React 18** - Библиотека пользовательского интерфейса
- **TypeScript** - Типизированный JavaScript
- **Tailwind CSS** - CSS фреймворк
- **shadcn/ui** - Компонентная библиотека

### Backend
- **Next.js API Routes** - Серверные API endpoints
- **MongoDB** - NoSQL база данных
- **Mongoose** - ODM для MongoDB
- **NextAuth.js** - Аутентификация
- **Redis** - Кэширование

### Инструменты разработки
- **ESLint** - Линтер JavaScript/TypeScript
- **Stylelint** - Линтер CSS
- **PostCSS** - Обработчик CSS
- **PWA** - Progressive Web App

### Интернационализация
- **next-intl** - Библиотека интернационализации
- Поддержка языков: русский (ru), английский (en), киргизский (kg)

## Особенности архитектуры

1. **Модульная структура** - Четкое разделение компонентов, хуков, сервисов
2. **Интернационализация** - Полная поддержка многоязычности
3. **PWA готовность** - Service Worker и манифест
4. **Типобезопасность** - Полное покрытие TypeScript
5. **Оптимизация производительности** - Ленивая загрузка, кэширование
6. **E-commerce функциональность** - Корзина, избранное, заказы
7. **Административная панель** - Управление контентом
8. **Аналитика** - Встроенные инструменты аналитики