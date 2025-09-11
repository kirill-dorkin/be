import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Product from '@/models/Product';
import { getSession } from '@/auth';


// GET - Получить список товаров с фильтрацией
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    interface ProductFilter {
      category?: string;
      price?: { $gte?: number; $lte?: number };
      inStock?: boolean;
      stockQuantity?: { $gt: number };
      featured?: boolean;
      brand?: string;
      $text?: { $search: string };
    }
    
    const filters: ProductFilter = {};
    
    // Применяем фильтры
    const category = searchParams.get('category');
    if (category) {
      filters.category = category;
    }
    
    if (searchParams.get('minPrice') || searchParams.get('maxPrice')) {
      filters.price = {};
      if (searchParams.get('minPrice')) {
        filters.price.$gte = parseFloat(searchParams.get('minPrice')!);
      }
      if (searchParams.get('maxPrice')) {
        filters.price.$lte = parseFloat(searchParams.get('maxPrice')!);
      }
    }
    
    if (searchParams.get('inStock') === 'true') {
      filters.inStock = true;
      filters.stockQuantity = { $gt: 0 };
    }
    
    if (searchParams.get('featured') === 'true') {
      filters.featured = true;
    }
    
    const brand = searchParams.get('brand');
    if (brand) {
      filters.brand = brand;
    }
    
    // Поиск по тексту
    const search = searchParams.get('search');
    if (search) {
      filters.$text = { $search: search };
    }
    
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    const products = await Product.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Product.countDocuments(filters);
    
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении товаров' },
      { status: 500 }
    );
  }
}

// POST - Создать новый товар (только для админов)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }
    
    await connectToDatabase();
    
    const body = await request.json();
    const {
      name,
      description,
      price,
      images,
      category,
      brand,
      stockQuantity,
      sku,
      weight,
      dimensions,
      tags,
      featured
    } = body;
    
    // Валидация обязательных полей
    if (!name || !description || !price || !images || !category || stockQuantity === undefined) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      );
    }
    
    const product = new Product({
      name,
      description,
      price,
      images,
      category,
      brand,
      stockQuantity,
      inStock: stockQuantity > 0,
      sku,
      weight,
      dimensions,
      tags,
      featured: featured || false
    });
    
    await product.save();
    
    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'SKU уже существует' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ошибка при создании товара' },
      { status: 500 }
    );
  }
}