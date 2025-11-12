#!/bin/bash

# Скрипт для запуска Chrome с remote debugging на macOS
# Это позволяет подключаться к браузеру через DevTools Protocol

echo "🚀 Запускаю Chrome с remote debugging..."
echo ""

# Создаем постоянную директорию для профиля с remote debugging
CHROME_DEBUG_PROFILE="$HOME/.chrome-debug-profile"
mkdir -p "$CHROME_DEBUG_PROFILE"

echo "После запуска вы можете:"
echo "  1. Войти в свой Google аккаунт (если еще не вошли)"
echo "  2. Открыть нужные вкладки"
echo "  3. Запустить скрипт: pnpm images:add"
echo ""

# Закрываем все запущенные Chrome процессы
echo "Закрываю открытые процессы Chrome..."
pkill -9 -i chrome 2>/dev/null
sleep 1

# Запускаем Chrome с remote debugging портом 9222
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$CHROME_DEBUG_PROFILE" \
  > /dev/null 2>&1 &

sleep 3

# Проверяем что порт доступен
if lsof -nP -iTCP:9222 -sTCP:LISTEN > /dev/null 2>&1; then
  echo "✅ Chrome запущен с remote debugging на порту 9222"
  echo "✅ Профиль сохранен в: $CHROME_DEBUG_PROFILE"
  echo ""
  echo "Теперь можно запустить скрипт добавления изображений:"
  echo "  pnpm images:add"
else
  echo "❌ Ошибка: Порт 9222 недоступен"
  echo "Попробуйте запустить вручную:"
  echo "  /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 --user-data-dir=\"$CHROME_DEBUG_PROFILE\" &"
fi
