import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/User';
import Role from '@/models/Role';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Получить конкретного пользователя
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Недопустимый ID пользователя' },
        { status: 400 }
      );
    }

    const user = await User.findById(id)
      .select('-passwordHash')
      .populate('tasks', 'description status createdAt')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - Обновить пользователя
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { name, email, role, password, image, isActive } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Недопустимый ID пользователя' },
        { status: 400 }
      );
    }

    // Проверка существования пользователя
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Предотвращение изменения собственной роли
    if (id === session.user?.id && role && role !== existingUser.role) {
      return NextResponse.json(
        { error: 'Нельзя изменить собственную роль' },
        { status: 403 }
      );
    }

    // Проверка уникальности email
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Пользователь с таким email уже существует' },
          { status: 409 }
        );
      }
    }

    // Подготовка данных для обновления
    const updateData: Partial<IUser> = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined && ['admin', 'worker', 'user'].includes(role)) {
      updateData.role = role as 'admin' | 'worker' | 'user';
    }
    if (image !== undefined) updateData.image = image;

    // Обновление пароля если предоставлен
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    // Обновление пользователя
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    // Обновление роли в таблице ролей
    if (updateData.role || updateData.email) {
      await Role.findOneAndUpdate(
        { email: existingUser.email },
        { 
          email: updateData.email || existingUser.email,
          role: updateData.role || existingUser.role 
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Пользователь успешно обновлен'
    });

  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить пользователя
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Недопустимый ID пользователя' },
        { status: 400 }
      );
    }

    // Предотвращение удаления самого себя
    if (id === session.user?.id) {
      return NextResponse.json(
        { error: 'Нельзя удалить собственный аккаунт' },
        { status: 403 }
      );
    }

    // Проверка существования пользователя
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Удаление пользователя
    await User.findByIdAndDelete(id);
    
    // Удаление роли
    await Role.deleteOne({ email: user.email });

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно удален'
    });

  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}