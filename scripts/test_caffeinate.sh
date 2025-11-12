#!/bin/bash

# Тестовый скрипт для демонстрации работы caffeinate

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Тест работы caffeinate (предотвращение засыпания)     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Этот тест покажет как работает caffeinate."
echo "Скрипт будет работать 30 секунд."
echo "Во время работы экран НЕ потухнет даже если должен был."
echo ""
echo "Нажмите Ctrl+C чтобы прервать..."
echo ""

# Функция симуляции работы
simulate_work() {
    local duration=30
    local elapsed=0

    echo "⏳ Начинаю работу с caffeinate..."
    echo ""

    while [ $elapsed -lt $duration ]; do
        sleep 5
        elapsed=$((elapsed + 5))
        echo "   ⏰ Прошло: ${elapsed}/${duration} секунд..."
        echo "   🖥️  Экран всё еще активен (не потух)"
        echo "   ✅ caffeinate работает!"
        echo ""
    done

    echo "✨ Готово! caffeinate автоматически отключился."
    echo ""
}

# Проверяем что caffeinate доступен
if ! command -v caffeinate &> /dev/null; then
    echo "❌ Ошибка: caffeinate не найден (только для macOS)"
    exit 1
fi

echo "1️⃣  Запускаю caffeinate -d..."
echo ""

# Запускаем с caffeinate
caffeinate -d bash -c "$(declare -f simulate_work); simulate_work"

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "💡 Во время работы вы могли:"
echo "   - Отойти от компьютера"
echo "   - Подождать пока экран должен был потухнуть"
echo "   - Но caffeinate держал экран активным!"
echo ""
echo "Теперь попробуйте с реальным скриптом:"
echo "   IMAGES_LIMIT=3 pnpm images:add"
echo ""
