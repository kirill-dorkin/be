import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/dbConnect';
import Favorite from '@/models/Favorite';
import { authOptions } from '@/auth';
import { getTranslations } from 'next-intl/server';

// DELETE - Очистить все избранные товары пользователя
export async function DELETE() {
  try {
    const t = await getTranslations('api.errors');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: t('unauthorized') },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const result = await Favorite.deleteMany({
      userId: session.user.id
    });

    const tMessages = await getTranslations('api.messages');
    return NextResponse.json({
      success: true,
      message: tMessages('favoritesCleared', { count: result.deletedCount }),
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing favorites:', error);
    const t = await getTranslations('api.errors');
    return NextResponse.json(
      { error: t('clearingFavorites') },
      { status: 500 }
    );
  }
}