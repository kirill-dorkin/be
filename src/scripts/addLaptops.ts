import mongoose from 'mongoose';
import Product from '@/models/Product';
import { connectToDatabase } from '@/lib/dbConnect';

const laptops = [
  {
    name: "MacBook Pro 16\" M3 Max",
    description: "Профессиональный ноутбук с чипом M3 Max, 16-дюймовым Liquid Retina XDR дисплеем и невероятной производительностью для самых требовательных задач.",
    price: 299999,
    images: ["/images/laptop-store.jpg"],
    category: "Ноутбуки",
    brand: "Apple",
    inStock: true,
    stockQuantity: 5,
    sku: "MBP16-M3MAX-001",
    weight: 2.16,
    dimensions: {
      length: 35.57,
      width: 24.81,
      height: 1.68
    },
    tags: ["премиум", "профессиональный", "Apple Silicon", "Retina"],
    featured: true
  },
  {
    name: "Dell XPS 13 Plus",
    description: "Ультрабук премиум-класса с процессором Intel Core i7 12-го поколения, 13.4\" OLED дисплеем и современным дизайном без рамок.",
    price: 189999,
    images: ["/images/tablets-lined-up-display-shopping-mall.jpg"],
    category: "Ноутбуки",
    brand: "Dell",
    inStock: true,
    stockQuantity: 8,
    sku: "XPS13-PLUS-002",
    weight: 1.26,
    dimensions: {
      length: 29.57,
      width: 19.91,
      height: 1.55
    },
    tags: ["ультрабук", "OLED", "компактный", "премиум"],
    featured: true
  },
  {
    name: "ASUS ROG Strix G15",
    description: "Игровой ноутбук с процессором AMD Ryzen 7, видеокартой NVIDIA RTX 4060, 15.6\" дисплеем 144Hz для максимального игрового опыта.",
    price: 149999,
    images: ["/images/laptop-store.jpg"],
    category: "Ноутбуки",
    brand: "ASUS",
    inStock: true,
    stockQuantity: 12,
    sku: "ROG-G15-003",
    weight: 2.3,
    dimensions: {
      length: 35.4,
      width: 25.9,
      height: 2.34
    },
    tags: ["игровой", "RTX", "144Hz", "RGB подсветка"],
    featured: false
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    description: "Бизнес-ноутбук с процессором Intel Core i5, 14\" дисплеем, прочным корпусом из углеродного волокна и длительным временем работы.",
    price: 169999,
    images: ["/images/tablets-lined-up-display-shopping-mall.jpg"],
    category: "Ноутбуки",
    brand: "Lenovo",
    inStock: true,
    stockQuantity: 6,
    sku: "TP-X1C-004",
    weight: 1.12,
    dimensions: {
      length: 31.5,
      width: 22.1,
      height: 1.49
    },
    tags: ["бизнес", "легкий", "прочный", "ThinkPad"],
    featured: false
  },
  {
    name: "HP Pavilion Gaming 15",
    description: "Доступный игровой ноутбук с процессором AMD Ryzen 5, видеокартой GTX 1650, 15.6\" IPS дисплеем и стильным дизайном.",
    price: 89999,
    images: ["/images/laptop-store.jpg"],
    category: "Ноутбуки",
    brand: "HP",
    inStock: true,
    stockQuantity: 15,
    sku: "HP-PAV15-005",
    weight: 2.25,
    dimensions: {
      length: 35.85,
      width: 25.6,
      height: 2.36
    },
    tags: ["игровой", "доступный", "AMD", "GTX"],
    featured: false
  },
  {
    name: "Microsoft Surface Laptop 5",
    description: "Элегантный ноутбук с процессором Intel Core i7, 13.5\" PixelSense дисплеем, премиальными материалами и интеграцией с экосистемой Microsoft.",
    price: 179999,
    images: ["/images/tablets-lined-up-display-shopping-mall.jpg"],
    category: "Ноутбуки",
    brand: "Microsoft",
    inStock: true,
    stockQuantity: 7,
    sku: "SL5-13-006",
    weight: 1.29,
    dimensions: {
      length: 30.8,
      width: 22.3,
      height: 1.47
    },
    tags: ["премиум", "PixelSense", "Windows 11", "элегантный"],
    featured: true
  },
  {
    name: "Acer Nitro 5",
    description: "Бюджетный игровой ноутбук с процессором Intel Core i5, видеокартой RTX 3050, 15.6\" дисплеем 120Hz и эффективной системой охлаждения.",
    price: 79999,
    images: ["/images/laptop-store.jpg"],
    category: "Ноутбуки",
    brand: "Acer",
    inStock: true,
    stockQuantity: 20,
    sku: "NITRO5-007",
    weight: 2.5,
    dimensions: {
      length: 36.3,
      width: 25.5,
      height: 2.39
    },
    tags: ["бюджетный", "игровой", "120Hz", "RTX 3050"],
    featured: false
  },
  {
    name: "ASUS ZenBook 14",
    description: "Стильный ультрабук с процессором AMD Ryzen 7, 14\" OLED дисплеем, металлическим корпусом и инновационным тачпадом ScreenPad.",
    price: 119999,
    images: ["/images/tablets-lined-up-display-shopping-mall.jpg"],
    category: "Ноутбуки",
    brand: "ASUS",
    inStock: true,
    stockQuantity: 10,
    sku: "ZB14-OLED-008",
    weight: 1.39,
    dimensions: {
      length: 31.9,
      width: 20.8,
      height: 1.69
    },
    tags: ["OLED", "ScreenPad", "стильный", "металл"],
    featured: false
  },
  {
    name: "MSI Creator Z16P",
    description: "Ноутбук для создателей контента с процессором Intel Core i9, видеокартой RTX 4070, 16\" QHD+ дисплеем и профессиональной цветопередачей.",
    price: 249999,
    images: ["/images/laptop-store.jpg"],
    category: "Ноутбуки",
    brand: "MSI",
    inStock: true,
    stockQuantity: 4,
    sku: "MSI-Z16P-009",
    weight: 2.39,
    dimensions: {
      length: 35.9,
      width: 25.9,
      height: 1.99
    },
    tags: ["создатели", "RTX 4070", "QHD+", "профессиональный"],
    featured: true
  },
  {
    name: "Huawei MateBook X Pro",
    description: "Премиальный ультрабук с процессором Intel Core i7, 13.9\" сенсорным дисплеем 3K, металлическим корпусом и быстрой зарядкой.",
    price: 159999,
    images: ["/images/tablets-lined-up-display-shopping-mall.jpg"],
    category: "Ноутбуки",
    brand: "Huawei",
    inStock: true,
    stockQuantity: 8,
    sku: "MBXP-3K-010",
    weight: 1.33,
    dimensions: {
      length: 30.4,
      width: 21.7,
      height: 1.56
    },
    tags: ["премиум", "3K дисплей", "сенсорный", "быстрая зарядка"],
    featured: false
  }
];

async function addLaptops() {
  try {
    await connectToDatabase();
    console.log('Подключение к базе данных установлено');

    // Очистка существующих ноутбуков (опционально)
    await Product.deleteMany({ category: 'Ноутбуки' });
    console.log('Существующие ноутбуки удалены');

    // Добавление новых ноутбуков
    const result = await Product.insertMany(laptops);
    console.log(`Добавлено ${result.length} ноутбуков в базу данных`);

    console.log('Ноутбуки успешно добавлены:');
    result.forEach((laptop, index) => {
      console.log(`${index + 1}. ${laptop.name} - ${laptop.price}₽`);
    });

  } catch (error) {
    console.error('Ошибка при добавлении ноутбуков:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Соединение с базой данных закрыто');
  }
}

addLaptops();