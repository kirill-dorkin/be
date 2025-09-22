'use client'

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  // Состояние для хранения debounced значения
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Обновляем debounced значение после задержки
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Отменяем timeout если value изменилось (также при размонтировании компонента)
    // Это предотвращает debounced значение от обновления, если value изменился
    // в течение периода задержки. Timeout получает сброс.
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // Запускается только если value или delay изменились

  return debouncedValue
}