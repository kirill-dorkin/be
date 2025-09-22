'use server'

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
  createdAt: string
  updatedAt: string
  dueDate?: string
}

export async function getTasksAction(page: number = 1, perPage: number = 5): Promise<{ items: Task[], totalItemsLength: number }> {
  // Заглушка для получения задач
  // В реальном приложении здесь будет запрос к базе данных
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Ремонт iPhone 12',
      description: 'Замена экрана',
      status: 'in_progress',
      priority: 'high',
      assignedTo: 'Мастер Иван',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // вчера
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString() // завтра
    },
    {
      id: '2',
      title: 'Ремонт MacBook Pro',
      description: 'Замена клавиатуры',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 дня назад
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 259200000).toISOString() // через 3 дня
    },
    {
      id: '3',
      title: 'Ремонт Samsung Galaxy',
      description: 'Замена батареи',
      status: 'completed',
      priority: 'low',
      assignedTo: 'Мастер Петр',
      createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 дня назад
      updatedAt: new Date(Date.now() - 86400000).toISOString() // вчера
    }
  ]

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const items = mockTasks.slice(startIndex, endIndex);
  
  return {
    items,
    totalItemsLength: mockTasks.length
  };
}