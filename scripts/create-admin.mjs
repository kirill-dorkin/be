import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Подключение к базе данных
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/be-kg'

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Подключено к MongoDB')
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error)
    throw error
  }
}

// Схема пользователя (копия из User.ts)
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'user', 'worker'], required: true },
    image: { type: String, required: true },
    passwordHash: { type: String, required: false },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: undefined }],
  },
  {
    timestamps: true,
  }
)

const User = mongoose.models.User || mongoose.model('User', UserSchema)

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
      image: '/default-avatar.png' // Обязательное поле согласно схеме
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