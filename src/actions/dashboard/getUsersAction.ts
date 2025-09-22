'use server'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'manager' | 'worker' | 'client'
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

export async function getUsersAction(): Promise<User[]> {
  try {
    // Здесь будет логика получения пользователей из базы данных
    // Пока что возвращаем заглушку с тестовыми данными
    
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Алексей Петров',
        email: 'alexey.petrov@example.com',
        phone: '+7 (999) 123-45-67',
        role: 'admin',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        lastLogin: '2024-01-20T14:22:00Z'
      },
      {
        id: '2',
        name: 'Мария Сидорова',
        email: 'maria.sidorova@example.com',
        phone: '+7 (999) 234-56-78',
        role: 'manager',
        isActive: true,
        createdAt: '2024-01-10T09:15:00Z',
        lastLogin: '2024-01-19T16:45:00Z'
      },
      {
        id: '3',
        name: 'Дмитрий Козлов',
        email: 'dmitry.kozlov@example.com',
        phone: '+7 (999) 345-67-89',
        role: 'worker',
        isActive: true,
        createdAt: '2024-01-08T11:20:00Z',
        lastLogin: '2024-01-18T13:30:00Z'
      },
      {
        id: '4',
        name: 'Анна Волкова',
        email: 'anna.volkova@example.com',
        phone: '+7 (999) 456-78-90',
        role: 'worker',
        isActive: false,
        createdAt: '2024-01-05T14:45:00Z',
        lastLogin: '2024-01-15T10:15:00Z'
      },
      {
        id: '5',
        name: 'Сергей Новиков',
        email: 'sergey.novikov@example.com',
        phone: '+7 (999) 567-89-01',
        role: 'client',
        isActive: true,
        createdAt: '2024-01-12T16:00:00Z'
      },
      {
        id: '6',
        name: 'Елена Морозова',
        email: 'elena.morozova@example.com',
        phone: '+7 (999) 678-90-12',
        role: 'client',
        isActive: true,
        createdAt: '2024-01-18T12:30:00Z',
        lastLogin: '2024-01-20T09:45:00Z'
      },
      {
        id: '7',
        name: 'Игорь Лебедев',
        email: 'igor.lebedev@example.com',
        phone: '+7 (999) 789-01-23',
        role: 'worker',
        isActive: true,
        createdAt: '2024-01-03T08:15:00Z',
        lastLogin: '2024-01-17T15:20:00Z'
      }
    ]

    return mockUsers
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error)
    return []
  }
}