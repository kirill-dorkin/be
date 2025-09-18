import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/User';
import Role from '@/models/Role';
import bcrypt from 'bcryptjs';

interface UserFilter {
  $or?: Array<{ name?: { $regex: string; $options: string } } | { email?: { $regex: string; $options: string } }>;
  role?: string;
}

// GET - Получить всех пользователей с фильтрацией и пагинацией
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Построение фильтра
    const filter: UserFilter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }

    // Подсчет общего количества
    const total = await User.countDocuments(filter);
    
    // Получение пользователей с пагинацией
    const users = await User.find(filter)
      .select('-passwordHash')
      .populate('tasks', 'description status')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Статистика по ролям
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      roleStats: roleStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - Создать нового пользователя
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name, email, role, password, image } = body;

    // Валидация
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Имя, email и роль обязательны' },
        { status: 400 }
      );
    }

    if (!['admin', 'worker', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Недопустимая роль' },
        { status: 400 }
      );
    }

    // Проверка существования пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Создание пользователя
    const userData: Partial<IUser> = {
      name,
      email,
      role: role as 'admin' | 'worker' | 'user',
      image: image || '/default-avatar.png'
    };

    // Хеширование пароля если предоставлен
    if (password) {
      userData.passwordHash = await bcrypt.hash(password, 12);
    }

    const user = new User(userData);
    await user.save();

    // Создание записи роли
    await Role.findOneAndUpdate(
      { email },
      { email, role },
      { upsert: true }
    );

    // Возврат пользователя без пароля
    const { passwordHash, ...userResponse } = user.toObject();

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'Пользователь успешно создан'
    }, { status: 201 });

  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - Массовые операции с пользователями
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { action, userIds, data } = body;

    switch (action) {
      case 'bulkDelete':
        // Предотвращение удаления самого себя
        const filteredIds = userIds.filter((id: string) => id !== session.user?.id);
        
        await User.deleteMany({ _id: { $in: filteredIds } });
        await Role.deleteMany({ 
          email: { 
            $in: await User.find({ _id: { $in: filteredIds } }).distinct('email') 
          } 
        });
        
        return NextResponse.json({
          success: true,
          message: `Удалено ${filteredIds.length} пользователей`
        });

      case 'bulkRoleUpdate':
        const { newRole } = data;
        
        if (!['admin', 'worker', 'user'].includes(newRole)) {
          return NextResponse.json(
            { error: 'Недопустимая роль' },
            { status: 400 }
          );
        }

        // Предотвращение изменения роли самого себя
        const updateIds = userIds.filter((id: string) => id !== session.user?.id);
        
        await User.updateMany(
          { _id: { $in: updateIds } },
          { role: newRole }
        );

        // Обновление таблицы ролей
        const users = await User.find({ _id: { $in: updateIds } }).select('email');
        for (const user of users) {
          await Role.findOneAndUpdate(
            { email: user.email },
            { role: newRole },
            { upsert: true }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: `Роль изменена для ${updateIds.length} пользователей`
        });

      default:
        return NextResponse.json(
          { error: 'Неизвестное действие' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Ошибка при массовой операции:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}