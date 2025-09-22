'use server'

export interface TaskDetail {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: {
    id: string
    name: string
    email: string
    avatar?: string
  } | null
  client: {
    id: string
    name: string
    phone: string
    email: string
  }
  service: {
    id: string
    name: string
    price: number
    duration: number
  }
  device: {
    id: string
    name: string
    brand: string
    model: string
    serialNumber: string
  } | null
  address: string
  scheduledDate: string | null
  completedDate: string | null
  createdAt: string
  updatedAt: string
  notes: string[]
  attachments: {
    id: string
    name: string
    url: string
    type: string
    uploadedAt: string
  }[]
}

export async function getTaskByIdAction(taskId: string): Promise<TaskDetail | null> {
  // Заглушка для получения задачи по ID
  // В реальном приложении здесь будет запрос к базе данных
  
  if (!taskId) {
    return null
  }

  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 200))

  const mockTask: TaskDetail = {
    id: taskId,
    title: 'Ремонт стиральной машины Samsung',
    description: 'Стиральная машина не включается, нет реакции на кнопки. Клиент сообщает, что проблема началась после скачка напряжения.',
    status: 'in_progress',
    priority: 'high',
    assignedTo: {
      id: '1',
      name: 'Алексей Петров',
      email: 'alexey@example.com',
      avatar: '/avatars/alexey.jpg'
    },
    client: {
      id: 'client-1',
      name: 'Мария Иванова',
      phone: '+996 555 123 456',
      email: 'maria@example.com'
    },
    service: {
      id: 'service-1',
      name: 'Ремонт стиральной машины',
      price: 1500,
      duration: 120
    },
    device: {
      id: 'device-1',
      name: 'Стиральная машина Samsung WW70J5210IW',
      brand: 'Samsung',
      model: 'WW70J5210IW',
      serialNumber: 'SN123456789'
    },
    address: 'г. Бишкек, ул. Чуй 123, кв. 45',
    scheduledDate: '2024-01-25T14:00:00Z',
    completedDate: null,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-24T16:45:00Z',
    notes: [
      'Клиент подтвердил время визита на 25.01 в 14:00',
      'Взять с собой мультиметр и запчасти для блока питания',
      'Возможно потребуется замена платы управления'
    ],
    attachments: [
      {
        id: 'att-1',
        name: 'photo_problem.jpg',
        url: '/uploads/photo_problem.jpg',
        type: 'image/jpeg',
        uploadedAt: '2024-01-20T10:35:00Z'
      },
      {
        id: 'att-2',
        name: 'warranty_card.pdf',
        url: '/uploads/warranty_card.pdf',
        type: 'application/pdf',
        uploadedAt: '2024-01-20T10:40:00Z'
      }
    ]
  }

  return mockTask
}