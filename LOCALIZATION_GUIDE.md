# Руководство по локализации проекта

## Обзор

Проект поддерживает три языка:
- 🇺🇸 **Английский (en)** - основной язык
- 🇷🇺 **Русский (ru)** - для русскоязычных пользователей
- 🇰🇬 **Кыргызский (kg)** - для пользователей из Кыргызстана

## Структура файлов

```
src/
├── i18n.ts                    # Конфигурация next-intl
├── middleware.ts              # Обработка маршрутизации локалей
├── messages/                  # Языковые файлы
│   ├── en.json               # Английские переводы
│   ├── ru.json               # Русские переводы
│   └── kg.json               # Кыргызские переводы
├── components/
│   ├── LanguageSwitcher.tsx  # Компонент переключения языков
│   └── LocalizedExample.tsx  # Пример использования переводов
└── app/
    ├── layout.tsx            # Корневой layout
    └── [locale]/
        └── layout.tsx        # Layout с поддержкой локализации
```

## Использование переводов в компонентах

### Базовое использование

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');
  
  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <button>{t('buttons.save')}</button>
    </div>
  );
}
```

### Использование нескольких пространств имен

```tsx
export default function LoginForm() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  
  return (
    <form>
      <h2>{t('login')}</h2>
      <input placeholder={t('email')} />
      <input placeholder={t('password')} />
      <button>{t('signIn')}</button>
      <button type="button">{tCommon('buttons.cancel')}</button>
    </form>
  );
}
```

### Серверные компоненты

```tsx
import { getTranslations } from 'next-intl/server';

export default async function ServerComponent() {
  const t = await getTranslations('products');
  
  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

## Структура переводов

### Пространства имен

- **common** - общие элементы (кнопки, навигация, статусы, сообщения)
- **auth** - авторизация и регистрация
- **products** - товары и каталог
- **cart** - корзина покупок
- **checkout** - оформление заказа
- **admin** - административная панель

### Пример структуры JSON

```json
{
  "common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel"
    },
    "navigation": {
      "home": "Home",
      "products": "Products"
    },
    "messages": {
      "success": "Operation completed successfully",
      "error": "An error occurred"
    }
  },
  "auth": {
    "login": "Login",
    "email": "Email",
    "password": "Password"
  }
}
```

## Добавление новых переводов

### 1. Добавьте ключ в английский файл

```json
// src/messages/en.json
{
  "products": {
    "newFeature": "New Feature"
  }
}
```

### 2. Добавьте переводы в другие языки

```json
// src/messages/ru.json
{
  "products": {
    "newFeature": "Новая функция"
  }
}
```

```json
// src/messages/kg.json
{
  "products": {
    "newFeature": "Жаңы функция"
  }
}
```

### 3. Используйте в компоненте

```tsx
const t = useTranslations('products');
return <span>{t('newFeature')}</span>;
```

## Переключение языков

Компонент `LanguageSwitcher` автоматически:
- Отображает текущий язык с флагом
- Предоставляет выпадающее меню для выбора языка
- Сохраняет текущий путь при смене языка
- Показывает состояние загрузки

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Header() {
  return (
    <header>
      <nav>
        {/* Другие элементы навигации */}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
```

## Маршрутизация

Все маршруты автоматически префиксируются локалью:
- `/en/products` - английская версия
- `/ru/products` - русская версия
- `/kg/products` - кыргызская версия

При переходе на корневой URL (`/`) пользователь автоматически перенаправляется на `/en/`.

## Форматирование данных

### Даты

```tsx
import { useFormatter } from 'next-intl';

export default function DateComponent() {
  const format = useFormatter();
  const date = new Date();
  
  return (
    <span>
      {format.dateTime(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </span>
  );
}
```

### Числа и валюты

```tsx
const format = useFormatter();
const price = 1234.56;

// Число
format.number(price); // 1,234.56 (en), 1 234,56 (ru)

// Валюта
format.number(price, {
  style: 'currency',
  currency: 'USD'
}); // $1,234.56
```

## Рекомендации

### 1. Организация ключей
- Используйте вложенную структуру для группировки связанных переводов
- Называйте ключи описательно: `confirmDelete` вместо `confirm`
- Избегайте слишком глубокой вложенности (максимум 3 уровня)

### 2. Работа с переводчиками
- Предоставляйте контекст для каждого перевода
- Указывайте ограничения по длине текста для UI элементов
- Отмечайте технические термины, которые не нужно переводить

### 3. Тестирование
- Проверяйте все языки на различных разрешениях экрана
- Убедитесь, что длинные переводы не ломают верстку
- Тестируйте переключение языков на всех страницах

### 4. Производительность
- Используйте серверные компоненты где возможно
- Избегайте загрузки всех переводов на клиент
- Рассмотрите lazy loading для больших объемов переводов

## Отладка

### Отсутствующие переводы
Если перевод не найден, next-intl покажет ключ в квадратных скобках: `[missing.key]`

### Проверка текущей локали
```tsx
import { useLocale } from 'next-intl';

export default function DebugComponent() {
  const locale = useLocale();
  console.log('Current locale:', locale);
  return null;
}
```

### Логирование переводов
```tsx
const t = useTranslations('common');
console.log('Translation for save button:', t('buttons.save'));
```

## Развертывание

При развертывании убедитесь, что:
1. Все языковые файлы включены в сборку
2. Middleware правильно настроен для обработки локалей
3. Статические пути генерируются для всех поддерживаемых языков

## Поддержка

Для добавления нового языка:
1. Добавьте код языка в `src/i18n.ts`
2. Создайте новый файл переводов в `src/messages/`
3. Добавьте язык в компонент `LanguageSwitcher`
4. Обновите middleware для обработки нового языка