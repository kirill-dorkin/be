'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Состояние для хранения значения
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      // Получаем значение из localStorage
      const item = window.localStorage.getItem(key)
      // Парсим сохраненный JSON или возвращаем initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // Если ошибка, возвращаем initialValue
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Возвращаем обернутую версию useState setter функции, которая
  // сохраняет новое значение в localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Позволяем value быть функцией, чтобы у нас был тот же API, что и у useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Сохраняем в state
      setStoredValue(valueToStore)
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // Более продвинутая реализация будет обрабатывать случай ошибки
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}