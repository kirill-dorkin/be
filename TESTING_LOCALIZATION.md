# План тестирования локализации

## Обзор

Данный документ описывает стратегию и процедуры тестирования системы локализации для обеспечения корректной работы переводов на всех поддерживаемых языках.

## Типы тестирования

### 1. Функциональное тестирование

#### 1.1 Переключение языков
- ✅ Переключение между en/ru/kg работает корректно
- ✅ URL обновляется с правильным префиксом локали
- ✅ Состояние языка сохраняется при навигации
- ✅ Переключение работает на всех страницах
- ✅ Редирект с корневого URL на /en/

#### 1.2 Отображение переводов
- ✅ Все тексты отображаются на выбранном языке
- ✅ Отсутствующие переводы показывают ключи в скобках
- ✅ Вложенные ключи переводов работают корректно
- ✅ Переводы загружаются для серверных компонентов
- ✅ Переводы работают в клиентских компонентах

#### 1.3 Маршрутизация
- ✅ Все маршруты доступны с префиксами локалей
- ✅ Middleware корректно обрабатывает локали
- ✅ Генерация статических путей для всех языков
- ✅ 404 страницы локализованы

### 2. UI/UX тестирование

#### 2.1 Адаптивность интерфейса
- ✅ Длинные переводы не ломают верстку
- ✅ Кнопки и элементы формы корректно отображаются
- ✅ Выпадающие меню помещаются в контейнеры
- ✅ Мобильная версия работает корректно

#### 2.2 Типографика и читаемость
- ✅ Шрифты поддерживают все символы (кириллица)
- ✅ Размеры шрифтов подходят для всех языков
- ✅ Межстрочные интервалы корректны
- ✅ Выравнивание текста соответствует языку

#### 2.3 Визуальные элементы
- ✅ Флаги стран отображаются корректно
- ✅ Иконки соответствуют контексту
- ✅ Цветовая схема подходит для всех языков

### 3. Производительность

#### 3.1 Загрузка переводов
- ✅ Время загрузки страниц приемлемо
- ✅ Переводы кэшируются корректно
- ✅ Размер бандла не увеличился критично
- ✅ Lazy loading работает при необходимости

#### 3.2 Переключение языков
- ✅ Переключение происходит без задержек
- ✅ Состояние загрузки отображается корректно
- ✅ Нет мерцания при смене языка

### 4. Совместимость

#### 4.1 Браузеры
- ✅ Chrome (последние 2 версии)
- ✅ Firefox (последние 2 версии)
- ✅ Safari (последние 2 версии)
- ✅ Edge (последние 2 версии)

#### 4.2 Устройства
- ✅ Desktop (1920x1080, 1366x768)
- ✅ Tablet (768x1024, 1024x768)
- ✅ Mobile (375x667, 414x896)

## Тестовые сценарии

### Сценарий 1: Базовое переключение языков

```
1. Открыть главную страницу
2. Убедиться, что язык по умолчанию - английский
3. Нажать на переключатель языков
4. Выбрать русский язык
5. Проверить:
   - URL изменился на /ru/
   - Все тексты отображаются на русском
   - Переключатель показывает русский флаг
6. Повторить для кыргызского языка
```

### Сценарий 2: Навигация с сохранением языка

```
1. Установить язык на русский
2. Перейти на страницу товаров
3. Проверить URL: /ru/products
4. Убедиться, что все тексты на русском
5. Перейти в корзину
6. Проверить URL: /ru/cart
7. Убедиться, что язык сохранился
```

### Сценарий 3: Тестирование форм

```
1. Открыть форму авторизации
2. Переключить на кыргызский язык
3. Проверить:
   - Плейсхолдеры переведены
   - Кнопки переведены
   - Сообщения об ошибках переведены
   - Валидация работает корректно
```

### Сценарий 4: Тестирование длинных текстов

```
1. Найти страницу с длинными текстами
2. Переключить на русский (обычно длиннее английского)
3. Проверить:
   - Тексты не выходят за границы контейнеров
   - Кнопки не перекрываются
   - Читаемость сохраняется
4. Проверить на мобильном устройстве
```

## Автоматизированное тестирование

### Unit тесты

```typescript
// __tests__/i18n.test.ts
import { getTranslations } from 'next-intl/server';

describe('Translations', () => {
  it('should load English translations', async () => {
    const t = await getTranslations({ locale: 'en', namespace: 'common' });
    expect(t('buttons.save')).toBe('Save');
  });

  it('should load Russian translations', async () => {
    const t = await getTranslations({ locale: 'ru', namespace: 'common' });
    expect(t('buttons.save')).toBe('Сохранить');
  });

  it('should load Kyrgyz translations', async () => {
    const t = await getTranslations({ locale: 'kg', namespace: 'common' });
    expect(t('buttons.save')).toBe('Сактоо');
  });
});
```

### Integration тесты

```typescript
// __tests__/language-switcher.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/products'
}));

describe('LanguageSwitcher', () => {
  it('should switch to Russian', () => {
    render(
      <NextIntlClientProvider locale="en" messages={{}}>
        <LanguageSwitcher />
      </NextIntlClientProvider>
    );

    fireEvent.click(screen.getByText('🇷🇺 Русский'));
    expect(mockPush).toHaveBeenCalledWith('/ru/products');
  });
});
```

### E2E тесты (Playwright)

```typescript
// e2e/localization.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Localization', () => {
  test('should switch languages correctly', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to /en/
    await expect(page).toHaveURL('/en/');
    
    // Switch to Russian
    await page.click('[data-testid="language-switcher"]');
    await page.click('text=🇷🇺 Русский');
    
    // Check URL and content
    await expect(page).toHaveURL('/ru/');
    await expect(page.locator('h1')).toContainText('Главная');
  });

  test('should preserve language during navigation', async ({ page }) => {
    await page.goto('/ru/');
    
    await page.click('text=Товары');
    await expect(page).toHaveURL('/ru/products');
    
    await page.click('text=Корзина');
    await expect(page).toHaveURL('/ru/cart');
  });
});
```

## Инструменты для тестирования

### 1. Проверка полноты переводов

```bash
# Скрипт для проверки отсутствующих переводов
npm run check-translations
```

```javascript
// scripts/check-translations.js
const fs = require('fs');
const path = require('path');

const languages = ['en', 'ru', 'kg'];
const messagesDir = path.join(__dirname, '../src/messages');

function checkTranslations() {
  const translations = {};
  
  // Загружаем все переводы
  languages.forEach(lang => {
    const filePath = path.join(messagesDir, `${lang}.json`);
    translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  });
  
  // Проверяем полноту
  const englishKeys = getAllKeys(translations.en);
  
  languages.slice(1).forEach(lang => {
    const langKeys = getAllKeys(translations[lang]);
    const missing = englishKeys.filter(key => !langKeys.includes(key));
    
    if (missing.length > 0) {
      console.log(`Missing translations in ${lang}:`);
      missing.forEach(key => console.log(`  - ${key}`));
    }
  });
}

function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  Object.keys(obj).forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object') {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  });
  
  return keys;
}

checkTranslations();
```

### 2. Визуальное тестирование

```typescript
// visual-tests/localization.spec.ts
import { test } from '@playwright/test';

test.describe('Visual Localization Tests', () => {
  ['en', 'ru', 'kg'].forEach(locale => {
    test(`should look correct in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/`);
      await expect(page).toHaveScreenshot(`homepage-${locale}.png`);
      
      await page.goto(`/${locale}/products`);
      await expect(page).toHaveScreenshot(`products-${locale}.png`);
    });
  });
});
```

## Чек-лист для релиза

### Перед релизом
- [ ] Все переводы добавлены и проверены
- [ ] Unit тесты проходят
- [ ] E2E тесты проходят
- [ ] Визуальные тесты проходят
- [ ] Проверена работа на всех устройствах
- [ ] Проверена работа во всех браузерах
- [ ] Производительность в норме
- [ ] Нет ошибок в консоли

### После релиза
- [ ] Мониторинг ошибок локализации
- [ ] Сбор обратной связи от пользователей
- [ ] Анализ метрик использования языков
- [ ] Планирование улучшений

## Отчетность

### Метрики для отслеживания
1. **Покрытие переводов** - процент переведенных строк
2. **Время загрузки** - влияние локализации на производительность
3. **Использование языков** - статистика выбора языков пользователями
4. **Ошибки переводов** - количество отсутствующих переводов

### Еженедельный отчет
```
Отчет по локализации за неделю:

✅ Покрытие переводов:
   - Английский: 100%
   - Русский: 98%
   - Кыргызский: 95%

📊 Использование языков:
   - Английский: 60%
   - Русский: 35%
   - Кыргызский: 5%

🐛 Найденные проблемы:
   - 3 отсутствующих перевода в админ-панели
   - Длинный текст в мобильной версии на русском

📋 Планы на следующую неделю:
   - Добавить недостающие переводы
   - Оптимизировать длинные тексты
   - Провести тестирование новых функций
```

## Заключение

Данный план тестирования обеспечивает комплексную проверку системы локализации на всех уровнях - от unit тестов до пользовательского опыта. Регулярное выполнение этих тестов гарантирует высокое качество локализации и удобство использования для пользователей всех поддерживаемых языков.