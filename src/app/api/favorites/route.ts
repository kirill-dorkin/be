import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/dbConnect';
import Favorite from '@/models/Favorite';
import Product from '@/models/Product';
import { authOptions } from '@/auth';
// GET - Получить список избранных товаров пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const favorites = await Favorite.find({ userId: session.user.id })
      .populate({
        path: 'productId',
        model: Product,
        select: 'name description price images category brand inStock stockQuantity featured'
      })
      .sort({ addedAt: -1 });

    const items = favorites.map(favorite => ({
      productId: favorite.productId._id,
      productInfo: favorite.productId,
      addedAt: favorite.addedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      items,
      count: items.length
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении избранного' },
      { status: 500 }
    );
  }
}

// POST - Добавить товар в избранное
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'ID товара обязателен' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Проверяем, существует ли товар
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Проверяем, не добавлен ли уже товар в избранное
    const existingFavorite = await Favorite.findOne({
      userId: session.user.id,
      productId
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Товар уже в избранном' },
        { status: 409 }
      );
    }

    // Добавляем товар в избранное
    const favorite = new Favorite({
      userId: session.user.id,
      productId
    });

    await favorite.save();

    return NextResponse.json({
      success: true,
      message: 'Товар добавлен в избранное'
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Ошибка при добавлении в избранное' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить товар из избранного
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'ID товара обязателен' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const result = await Favorite.findOneAndDelete({
      userId: session.user.id,
      productId
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Товар не найден в избранном' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Товар удален из избранного'
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении из избранного' },
      { status: 500 }
    );
  }
}