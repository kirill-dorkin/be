import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bekg';

async function recreateTestUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Подключение к MongoDB установлено');
    
    const db = client.db();
    const users = db.collection('users');
    
    // Удаляем существующего тестового пользователя
    await users.deleteOne({ email: 'user@example.com' });
    console.log('Старый тестовый пользователь удален');
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Создаем тестового пользователя с правильным полем
    const testUser = {
      email: 'user@example.com',
      passwordHash: hashedPassword,
      role: 'user',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await users.insertOne(testUser);
    
    console.log('Тестовый пользователь пересоздан:');
    console.log('Email: user@example.com');
    console.log('Password: password123');
    console.log('Role: user');
    
  } catch (error) {
    console.error('Ошибка при пересоздании тестового пользователя:', error);
  } finally {
    await client.close();
    console.log('Соединение с базой данных закрыто');
  }
}

recreateTestUser();