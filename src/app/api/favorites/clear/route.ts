import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/dbConnect';
import { Favorite } from '@/models/Favorite';
import { authOptions } from '@/lib/auth';

// DELETE - Очистить все избранные товары пользователя
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const result = await Favorite.deleteMany({
      userId: session.user.id
    });

    return NextResponse.json({
      success: true,
      message: `Удалено ${result.deletedCount} товаров из избранного`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return NextResponse.json(
      { error: 'Ошибка при очистке избранного' },
      { status: 500 }
    );
  }
}