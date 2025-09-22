'use server'

interface Device {
  id: string
  name: string
  brand: string
  model: string
  category: string
  status: 'available' | 'in_repair' | 'out_of_order'
  serialNumber: string
  purchaseDate: string
  warrantyExpiry?: string
}

export async function getDevicesAction(page?: number, perPage?: number): Promise<{ items: Device[], totalItemsLength: number }> {
  // Заглушка для получения устройств
  // В реальном приложении здесь будет запрос к базе данных
  const mockDevices: Device[] = [
    {
      id: '1',
      name: 'iPhone 14 Pro',
      brand: 'Apple',
      model: 'A2894',
      category: 'smartphone',
      status: 'available',
      serialNumber: 'F2LW48XHQD',
      purchaseDate: '2023-01-15',
      warrantyExpiry: '2024-01-15'
    },
    {
      id: '2',
      name: 'MacBook Pro 16"',
      brand: 'Apple',
      model: 'M2 Pro',
      category: 'laptop',
      status: 'in_repair',
      serialNumber: 'C02ZJ0XHMD6T',
      purchaseDate: '2023-03-20',
      warrantyExpiry: '2024-03-20'
    },
    {
      id: '3',
      name: 'Samsung Galaxy S23',
      brand: 'Samsung',
      model: 'SM-S911B',
      category: 'smartphone',
      status: 'available',
      serialNumber: 'R58N30FKMNB',
      purchaseDate: '2023-02-10',
      warrantyExpiry: '2024-02-10'
    },
    {
      id: '4',
      name: 'iPad Air',
      brand: 'Apple',
      model: 'A2588',
      category: 'tablet',
      status: 'out_of_order',
      serialNumber: 'DMPH2XHQJK',
      purchaseDate: '2022-11-05',
      warrantyExpiry: '2023-11-05'
    }
  ]

  return {
    items: mockDevices,
    totalItemsLength: mockDevices.length
  }
}