import { createDatabaseConnection, DatabaseConnection } from './dbUtils-postgres'

// Глобальная переменная для кеширования подключения в development
declare global {
  var __db: DatabaseConnection | undefined
}

let db: DatabaseConnection

if (process.env.NODE_ENV === 'production') {
  // В продакшене создаем новое подключение
  db = createDatabaseConnection()
} else {
  // В development используем глобальную переменную для предотвращения
  // создания множественных подключений при hot reload
  if (!global.__db) {
    global.__db = createDatabaseConnection()
  }
  db = global.__db
}

export default db

// Функция для инициализации подключения
export async function initializeDatabase(): Promise<boolean> {
  try {
    const connected = await db.connect()
    if (connected) {
      console.log('✅ База данных подключена успешно')
      return true
    } else {
      console.error('❌ Не удалось подключиться к базе данных')
      return false
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error)
    return false
  }
}

// Функция для проверки состояния подключения
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await db.query('SELECT 1 as health_check')
    return result.success
  } catch (error) {
    console.error('Ошибка проверки состояния БД:', error)
    return false
  }
}

// Функция для graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await db.disconnect()
    console.log('✅ Подключение к базе данных закрыто')
  } catch (error) {
    console.error('❌ Ошибка при закрытии подключения к БД:', error)
  }
}