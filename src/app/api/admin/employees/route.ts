import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import bcrypt from 'bcryptjs';

// GET - Получить всех сотрудников
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role'); // admin, manager, employee, user
    const status = searchParams.get('status'); // active, inactive
    const department = searchParams.get('department');
    const search = searchParams.get('search'); // поиск по имени или email
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Построение фильтра
    const filter: any = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (status) {
      filter.isActive = status === 'active';
    }
    
    if (department) {
      filter.department = department;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const totalCount = await User.countDocuments(filter);
    
    const employees = await User.find(filter)
      .select('-password') // Исключаем пароль из результата
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Статистика сотрудников
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          adminCount: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          },
          managerCount: {
            $sum: { $cond: [{ $eq: ['$role', 'manager'] }, 1, 0] }
          },
          employeeCount: {
            $sum: { $cond: [{ $eq: ['$role', 'employee'] }, 1, 0] }
          },
          userCount: {
            $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] }
          }
        }
      }
    ]);

    // Статистика по департаментам
    const departmentStats = await User.aggregate([
      {
        $match: {
          department: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      employees,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      },
      stats: stats[0] || {
        totalEmployees: 0,
        activeEmployees: 0,
        adminCount: 0,
        managerCount: 0,
        employeeCount: 0,
        userCount: 0
      },
      departmentStats
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Создать нового сотрудника
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      role,
      department,
      position,
      salary,
      hireDate,
      isActive = true
    } = body;

    // Валидация
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    // Проверка уникальности email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Валидация роли
    const validRoles = ['admin', 'manager', 'employee', 'user'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создание сотрудника
    const employee = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'employee',
      department,
      position,
      salary,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      isActive,
      createdBy: session.user.id
    });

    await employee.save();

    // Возвращаем данные без пароля
    const employeeData = employee.toObject();
    delete employeeData.password;

    return NextResponse.json({
      success: true,
      employee: employeeData,
      message: 'Employee created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Массовое обновление сотрудников
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { employeeIds, updateData } = body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json(
        { error: 'Employee IDs are required' },
        { status: 400 }
      );
    }

    // Валидация данных для обновления
    const allowedFields = ['role', 'department', 'position', 'salary', 'isActive'];
    const filteredUpdateData: any = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdateData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredUpdateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    filteredUpdateData.updatedAt = new Date();
    filteredUpdateData.updatedBy = session.user.id;

    const result = await User.updateMany(
      { _id: { $in: employeeIds } },
      { $set: filteredUpdateData }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Updated ${result.modifiedCount} employees`
    });
  } catch (error) {
    console.error('Error updating employees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}