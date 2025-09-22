'use server'

export interface DeleteTaskResult {
  message: string;
  status: string;
}

export async function deleteTaskAction(taskId: string): Promise<DeleteTaskResult> {
  try {
    // Валидация входных данных
    if (!taskId || typeof taskId !== 'string') {
      return {
        status: 'error',
        message: 'Некорректный ID задачи'
      }
    }

    // Здесь будет логика удаления задачи из базы данных
    // Пока что возвращаем заглушку
    console.log(`Удаление задачи с ID: ${taskId}`)
    
    // Имитация успешного удаления
    return {
      status: 'success',
      message: 'Задача успешно удалена'
    }
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error)
    return {
      status: 'error',
      message: 'Произошла ошибка при удалении задачи'
    }
  }
}