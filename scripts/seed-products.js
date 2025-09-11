const { MongoClient } = require('mongodb');

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/laptop-store';

const sampleProducts = [
  {
    name: 'MacBook Pro 14"',
    description: 'Мощный ноутбук для профессионалов с процессором M2 Pro',
    price: 199999,
    images: ['/images/macbook-pro-14.jpg'],
    category: 'Ноутбуки',
    brand: 'Apple',
    stockQuantity: 10,
    inStock: true,
    sku: 'MBP-14-M2-001',
    weight: 1.6,
    dimensions: { length: 31.26, width: 22.12, height: 1.55 },
    tags: ['premium', 'professional', 'apple'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Dell XPS 13',
    description: 'Компактный и мощный ультрабук для работы и учебы',
    price: 89999,
    images: ['/images/dell-xps-13.jpg'],
    category: 'Ноутбуки',
    brand: 'Dell',
    stockQuantity: 15,
    inStock: true,
    sku: 'DELL-XPS-13-001',
    weight: 1.2,
    dimensions: { length: 29.6, width: 19.9, height: 1.47 },
    tags: ['ultrabook', 'portable', 'business'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon',
    description: 'Надежный бизнес-ноутбук с отличной клавиатурой',
    price: 129999,
    images: ['/images/thinkpad-x1.jpg'],
    category: 'Ноутбуки',
    brand: 'Lenovo',
    stockQuantity: 8,
    inStock: true,
    sku: 'TP-X1-CARBON-001',
    weight: 1.13,
    dimensions: { length: 31.5, width: 22.1, height: 1.49 },
    tags: ['business', 'durable', 'lightweight'],
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'ASUS ROG Strix G15',
    description: 'Игровой ноутбук с мощной графикой RTX 4060',
    price: 149999,
    images: ['/images/asus-rog-g15.jpg'],
    category: 'Игровые ноутбуки',
    brand: 'ASUS',
    stockQuantity: 5,
    inStock: true,
    sku: 'ASUS-ROG-G15-001',
    weight: 2.3,
    dimensions: { length: 35.4, width: 25.9, height: 2.24 },
    tags: ['gaming', 'rtx', 'performance'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'HP Pavilion 15',
    description: 'Доступный ноутбук для повседневных задач',
    price: 49999,
    images: ['/images/hp-pavilion-15.jpg'],
    category: 'Ноутбуки',
    brand: 'HP',
    stockQuantity: 20,
    inStock: true,
    sku: 'HP-PAV-15-001',
    weight: 1.75,
    dimensions: { length: 36.0, width: 23.4, height: 1.79 },
    tags: ['affordable', 'everyday', 'student'],
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Microsoft Surface Laptop 5',
    description: 'Элегантный ноутбук с сенсорным экраном',
    price: 119999,
    images: ['/images/surface-laptop-5.jpg'],
    category: 'Ноутбуки',
    brand: 'Microsoft',
    stockQuantity: 12,
    inStock: true,
    sku: 'MS-SL5-001',
    weight: 1.27,
    dimensions: { length: 30.8, width: 22.3, height: 1.45 },
    tags: ['touchscreen', 'premium', 'portable'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedProducts() {
  const client = new MongoClient(DB_URL);
  
  try {
    await client.connect();
    console.log('Подключение к MongoDB установлено');
    
    const db = client.db();
    const collection = db.collection('products');
    
    // Очищаем коллекцию
    await collection.deleteMany({});
    console.log('Коллекция products очищена');
    
    // Добавляем тестовые продукты
    const result = await collection.insertMany(sampleProducts);
    console.log(`Добавлено ${result.insertedCount} продуктов`);
    
    // Создаем индексы
    await collection.createIndex({ name: 'text', description: 'text' });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ brand: 1 });
    await collection.createIndex({ price: 1 });
    await collection.createIndex({ featured: 1 });
    await collection.createIndex({ createdAt: -1 });
    
    console.log('Индексы созданы');
    
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
  } finally {
    await client.close();
    console.log('Соединение с MongoDB закрыто');
  }
}

seedProducts();