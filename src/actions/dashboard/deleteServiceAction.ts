'use server'

interface DeleteServiceResult {
  message: string
  status: string
}

export async function deleteServiceAction(serviceId: string): Promise<DeleteServiceResult> {
  // Заглушка для удаления услуги
  // В реальном приложении здесь будет запрос к базе данных
  
  if (!serviceId) {
    return {
      status: 'error',
      message: 'ID услуги не указан'
    }
  }

  try {
    // Имитация удаления из базы данных
    // await db.service.delete({ where: { id: serviceId } })
    
    return {
      status: 'success',
      message: 'Услуга успешно удалена'
    }
  } catch (error) {
    console.error('Ошибка при удалении услуги:', error)
    return {
      status: 'error',
      message: 'Произошла ошибка при удалении услуги'
    }
  }
}