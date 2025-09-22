'use server'

export async function deleteCategoryAction(id: string): Promise<{ message: string; status: string }> {
  try {
    // Заглушка для удаления категории
    // В реальном приложении здесь будет запрос к базе данных
    console.log(`Deleting category with id: ${id}`)
    
    return {
      message: 'Категория успешно удалена',
      status: 'success'
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    return {
      message: 'Ошибка при удалении категории',
      status: 'error'
    }
  }
}