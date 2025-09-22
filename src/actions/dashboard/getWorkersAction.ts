'use server'

interface Worker {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  status: 'active' | 'inactive' | 'busy'
  rating: number
  completedTasks: number
  joinedAt: string
  avatar?: string
}

export async function getWorkersAction(): Promise<{ users: Worker[] }> {
  // Заглушка для получения работников
  // В реальном приложении здесь будет запрос к базе данных
  const mockWorkers: Worker[] = [
    {
      id: '1',
      name: 'Иван Петров',
      email: 'ivan@example.com',
      phone: '+996 555 123 456',
      specialization: 'Ремонт iPhone',
      status: 'active',
      rating: 4.8,
      completedTasks: 156,
      joinedAt: new Date(Date.now() - 86400000 * 30).toISOString() // месяц назад
    },
    {
      id: '2',
      name: 'Петр Сидоров',
      email: 'petr@example.com',
      phone: '+996 555 234 567',
      specialization: 'Ремонт Android',
      status: 'busy',
      rating: 4.6,
      completedTasks: 89,
      joinedAt: new Date(Date.now() - 86400000 * 60).toISOString() // 2 месяца назад
    },
    {
      id: '3',
      name: 'Анна Иванова',
      email: 'anna@example.com',
      phone: '+996 555 345 678',
      specialization: 'Ремонт ноутбуков',
      status: 'active',
      rating: 4.9,
      completedTasks: 203,
      joinedAt: new Date(Date.now() - 86400000 * 90).toISOString() // 3 месяца назад
    }
  ]

  return { users: mockWorkers }
}