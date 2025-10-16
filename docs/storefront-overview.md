# Как устроен сайт Nimara для покупателей

Этот файл помогает понять, как выглядит и работает публичный сайт (storefront), чтобы сотрудники могли объяснять клиентам функциональность и проверять, что всё отображается правильно.

## 1. Основные разделы сайта
1. **Главная страница** — приветственный экран с баннерами и подборками товаров. Баннеры и тексты берутся из CMS (ButterCMS или встроенный CMS Saleor).
2. **Каталог** — страницы категорий и подборок. Фильтры и сортировки зависят от данных Saleor и настроек поиска в [apps/storefront/src/services/search.ts](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/search.ts).
3. **Страница товара (PDP)** — фотографии, описание, цена и кнопка «Добавить в корзину». Дополнительные блоки (характеристики, отзывы) тянутся из атрибутов Saleor.
4. **Корзина** — всплывающая панель и отдельная страница. Работает через сервис [apps/storefront/src/services/cart.ts](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/cart.ts).
5. **Оформление заказа** — шаги: контактные данные, адрес, доставка, оплата. Интеграция с Saleor и Stripe реализована в [apps/storefront/src/services/checkout.ts](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/services/checkout.ts).
6. **Личный кабинет** — вход по почте и паролю или через магическую ссылку. Авторизация описана в [apps/storefront/src/auth.ts](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/auth.ts).
7. **Сервисный центр** — отдельная страница [services](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/app/%5Blocale%5D/(main)/services/page.tsx) с каталогом ремонтных услуг и формой заявки.

## 2. Что важно проверять ежедневно
- **Заполненность витрины.** Откройте главную и пару категорий, убедитесь, что картинки и тексты подтянулись.
- **Наличие акций.** Если запустили новую скидку, проверьте, что цена в карточке товара и в корзине совпадает.
- **Сервисные заявки.** Отправьте тестовую заявку через форму «Заказать ремонт» на тестовом канале. Убедитесь, что приходит письмо и появляется черновой заказ в Saleor (см. [orders-and-service-requests.md](https://github.com/kirill-dorkin/be/blob/main/docs/orders-and-service-requests.md)).

## 3. Частые вопросы покупателей
| Вопрос клиента | Что ответить |
| --- | --- |
| «Какие способы оплаты доступны?» | Онлайн-оплата картой через Stripe, наложенный платёж отключен. |
| «Как отслеживать заказ?» | После оформления клиент получает письмо с номером заказа, статус можно узнать через поддержку. |
| «Сколько времени занимает ремонт?» | В карточке услуги указана примерная длительность. Также эта информация видна менеджеру в черновом заказе. |
| «Можно ли оформить заказ без регистрации?» | Да, достаточно указать электронную почту, аккаунт создаётся автоматически. |

## 4. Полезные ссылки
- Данные сервисного каталога: [apps/storefront/src/lib/repair-services/data.ts](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/lib/repair-services/data.ts).
- Точки входа API:
  - [api/repair-services](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/app/api/repair-services/route.ts) — возвращает список услуг.
  - [api/service-request](https://github.com/kirill-dorkin/be/blob/main/apps/storefront/src/app/api/service-request/route.ts) — принимает заявки.
- Руководство для сервисного центра: [docs/repair-services.md](https://github.com/kirill-dorkin/be/blob/main/docs/repair-services.md).

При обнаружении ошибки на сайте соберите скриншот, укажите ссылку и пример клиента, затем сообщите в команду разработки или поддержку.
