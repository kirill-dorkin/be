import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Cart, { ICartItem } from '@/models/Cart';
import Product, { IProduct } from '@/models/Product';
import { getSession } from '@/auth';
import mongoose from 'mongoose';

// GET - Получить корзину пользователя
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    let cart = await Cart.findOne({ userId: session.user.id }).lean();
    
    if (!cart) {
      // Создаем пустую корзину если её нет
      cart = await Cart.create({
        userId: session.user.id,
        items: [],
        totalAmount: 0
      });
    }
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении корзины' },
      { status: 500 }
    );
  }
}

// POST - Добавить товар в корзину
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const { productId, quantity = 1 } = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: 'Неверный ID товара' },
        { status: 400 }
      );
    }
    
    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Количество должно быть больше 0' },
        { status: 400 }
      );
    }
    
    // Проверяем существование товара
    const product = await Product.findById(productId).lean() as IProduct | null;
    
    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }
    
    if (!product.inStock || product.stockQuantity < quantity) {
      return NextResponse.json(
        { error: 'Недостаточно товара на складе' },
        { status: 400 }
      );
    }
    
    // Находим или создаем корзину
    let cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart) {
      cart = new Cart({
        userId: session.user.id,
        items: [],
        totalAmount: 0
      });
    }
    
    // Проверяем, есть ли уже этот товар в корзине
    const existingItemIndex = cart.items.findIndex(
      (item: ICartItem) => item.productId.toString() === productId
    );
    
    if (existingItemIndex >= 0) {
      // Обновляем количество существующего товара
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stockQuantity) {
        return NextResponse.json(
          { error: 'Недостаточно товара на складе' },
          { status: 400 }
        );
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Добавляем новый товар в корзину
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0] || ''
      });
    }
    
    await cart.save();
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Ошибка при добавлении в корзину' },
      { status: 500 }
    );
  }
}

// PUT - Обновить количество товара в корзине
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const { productId, quantity } = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: 'Неверный ID товара' },
        { status: 400 }
      );
    }
    
    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Количество должно быть больше 0' },
        { status: 400 }
      );
    }
    
    // Проверяем наличие товара на складе
    const product = await Product.findById(productId).lean() as IProduct | null;
    
    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }
    
    if (quantity > product.stockQuantity) {
      return NextResponse.json(
        { error: 'Недостаточно товара на складе' },
        { status: 400 }
      );
    }
    
    const cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart) {
      return NextResponse.json(
        { error: 'Корзина не найдена' },
        { status: 404 }
      );
    }
    
    const itemIndex = cart.items.findIndex(
      (item: ICartItem) => item.productId.toString() === productId
    );
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Товар не найден в корзине' },
        { status: 404 }
      );
    }
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении корзины' },
      { status: 500 }
    );
  }
}

// DELETE - Очистить корзину
export async function DELETE() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart) {
      return NextResponse.json(
        { error: 'Корзина не найдена' },
        { status: 404 }
      );
    }
    
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    
    return NextResponse.json(
      { message: 'Корзина очищена' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Ошибка при очистке корзины' },
      { status: 500 }
    );
  }
}