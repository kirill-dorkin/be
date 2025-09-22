import { connectToDatabase } from '../src/shared/lib/dbConnect'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

// Схема пользователя
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'worker'], default: 'worker' },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

async function createAdmin() {
  try {
    console.log('Подключение к базе данных...')
    await connectToDatabase()
    
    const adminEmail = 'admin@be.kg'
    const adminPassword = 'admin123'
    
    // Проверяем, существует ли уже администратор
    const existingAdmin = await User.findOne({ email: adminEmail })
    
    if (existingAdmin) {
      console.log('Администратор уже существует:', adminEmail)
      console.log('Роль:', existingAdmin.role)
      return
    }
    
    // Хешируем пароль
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds)
    
    // Создаем администратора
    const admin = new User({
      name: 'Администратор',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      image: null
    })
    
    await admin.save()
    
    console.log('✅ Администратор успешно создан!')
    console.log('Email:', adminEmail)
    console.log('Пароль:', adminPassword)
    console.log('Роль:', admin.role)
    
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error)
  } finally {
    await mongoose.connection.close()
    console.log('Соединение с базой данных закрыто')
  }
}

createAdmin()