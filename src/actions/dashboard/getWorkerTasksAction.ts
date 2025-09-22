export interface WorkerTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  clientName?: string
  deviceType?: string
  issueDescription?: string
}

export interface GetWorkerTasksResult {
  success: boolean
  tasks?: WorkerTask[]
  message?: string
}

export async function getWorkerTasksAction(workerId: string): Promise<GetWorkerTasksResult> {
  try {
    // TODO: Заменить на реальный запрос к базе данных
    if (!workerId) {
      return {
        success: false,
        message: 'ID работника не указан'
      }
    }

    // Заглушка данных
    const mockTasks: WorkerTask[] = [
      {
        id: '1',
        title: 'Замена экрана iPhone 13',
        description: 'Треснул экран, требуется замена дисплейного модуля',
        status: 'in_progress',
        priority: 'high',
        assignedTo: workerId,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        dueDate: new Date('2024-01-17'),
        estimatedHours: 2,
        clientName: 'Иван Петров',
        deviceType: 'iPhone 13',
        issueDescription: 'Разбитый экран после падения'
      },
      {
        id: '2',
        title: 'Ремонт материнской платы Samsung Galaxy',
        description: 'Не включается, подозрение на проблемы с питанием',
        status: 'pending',
        priority: 'medium',
        assignedTo: workerId,
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
        dueDate: new Date('2024-01-20'),
        estimatedHours: 4,
        clientName: 'Мария Сидорова',
        deviceType: 'Samsung Galaxy S21',
        issueDescription: 'Устройство не реагирует на кнопку питания'
      },
      {
        id: '3',
        title: 'Чистка ноутбука от пыли',
        description: 'Профилактическая чистка и замена термопасты',
        status: 'completed',
        priority: 'low',
        assignedTo: workerId,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-14'),
        dueDate: new Date('2024-01-15'),
        estimatedHours: 1,
        actualHours: 1.5,
        clientName: 'Алексей Козлов',
        deviceType: 'MacBook Pro 2019',
        issueDescription: 'Перегрев и шумная работа кулера'
      }
    ]

    return {
      success: true,
      tasks: mockTasks
    }
  } catch (error) {
    console.error('Ошибка при получении задач работника:', error)
    return {
      success: false,
      message: 'Произошла ошибка при получении задач'
    }
  }
}