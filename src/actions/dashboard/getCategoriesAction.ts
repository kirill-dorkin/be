'use server'

interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
}

export async function getCategoriesAction(page?: number, perPage?: number): Promise<{ items: Category[], totalItemsLength: number }> {
  // Заглушка для получения категорий
  // В реальном приложении здесь будет запрос к базе данных
  const categories = [
    {
      id: '1',
      name: 'Ремонт телефонов',
      description: 'Ремонт мобильных устройств',
      createdAt: new Date().toISOString()
    },
    {
      id: '2', 
      name: 'Ремонт ноутбуков',
      description: 'Ремонт портативных компьютеров',
      createdAt: new Date().toISOString()
    }
  ];
  
  return {
    items: categories,
    totalItemsLength: categories.length
  };
}