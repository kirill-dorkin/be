'use server'

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // в минутах
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function getServicesAction(page?: number, perPage?: number): Promise<{ items: Service[], totalItemsLength: number }> {
  // Заглушка для получения услуг
  // В реальном приложении здесь будет запрос к базе данных
  
  const mockServices: Service[] = [
    {
      id: '1',
      name: 'Ремонт стиральной машины',
      description: 'Диагностика и ремонт стиральных машин всех марок',
      price: 1500,
      duration: 120,
      category: 'Ремонт техники',
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Установка кондиционера',
      description: 'Профессиональная установка и настройка кондиционеров',
      price: 3000,
      duration: 180,
      category: 'Установка',
      isActive: true,
      createdAt: '2024-01-16T09:30:00Z',
      updatedAt: '2024-01-16T09:30:00Z'
    },
    {
      id: '3',
      name: 'Диагностика холодильника',
      description: 'Полная диагностика неисправностей холодильного оборудования',
      price: 800,
      duration: 60,
      category: 'Диагностика',
      isActive: true,
      createdAt: '2024-01-17T14:15:00Z',
      updatedAt: '2024-01-17T14:15:00Z'
    },
    {
      id: '4',
      name: 'Ремонт микроволновки',
      description: 'Ремонт микроволновых печей, замена магнетрона',
      price: 1200,
      duration: 90,
      category: 'Ремонт техники',
      isActive: false,
      createdAt: '2024-01-18T11:45:00Z',
      updatedAt: '2024-01-20T16:30:00Z'
    },
    {
      id: '5',
      name: 'Консультация по выбору техники',
      description: 'Помощь в выборе бытовой техники, рекомендации',
      price: 500,
      duration: 30,
      category: 'Консультация',
      isActive: true,
      createdAt: '2024-01-19T13:20:00Z',
      updatedAt: '2024-01-19T13:20:00Z'
    }
  ]

  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 100))

  return {
    items: mockServices,
    totalItemsLength: mockServices.length
  }
}