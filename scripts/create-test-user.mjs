import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bekg';

async function createTestUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Подключение к MongoDB установлено');
    
    const db = client.db();
    const users = db.collection('users');
    
    // Проверяем, существует ли уже тестовый пользователь
    const existingUser = await users.findOne({ email: 'user@example.com' });
    
    if (existingUser) {
      console.log('Тестовый пользователь уже существует');
      return;
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Создаем тестового пользователя
    const testUser = {
      email: 'user@example.com',
      passwordHash: hashedPassword,
      role: 'user',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await users.insertOne(testUser);
    
    console.log('Тестовый пользователь создан:');
    console.log('Email: user@example.com');
    console.log('Password: password123');
    console.log('Role: user');
    
  } catch (error) {
    console.error('Ошибка при создании тестового пользователя:', error);
  } finally {
    await client.close();
    console.log('Соединение с базой данных закрыто');
  }
}

createTestUser();