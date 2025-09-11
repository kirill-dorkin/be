import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Cart, { ICartItem } from '@/models/Cart';
import { getSession } from '@/auth';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{ productId: string }>;
}

// DELETE - Удалить товар из корзины
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const { productId } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: 'Неверный ID товара' },
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
    
    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    return NextResponse.json(
      { message: 'Товар удален из корзины' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении товара из корзины' },
      { status: 500 }
    );
  }
}