import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Требуется аутентификация' },
        { status: 401 }
      );
    }

    // Проверяем роль администратора
    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Требуется доступ администратора' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Доступ к панели администратора предоставлен',
        user: session.user 
      },
      {
        status: 200,
        headers: {
          'X-Content-Type-Options': 'nosniff',
        }
      }
    );

  } catch (error) {
    console.error('[Admin API Error]', error);
    
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}