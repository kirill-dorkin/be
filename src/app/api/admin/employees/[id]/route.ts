import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import bcrypt from 'bcryptjs';

// GET - Получить конкретного сотрудника
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const employee = await User.findById(params.id)
      .select('-password')
      .lean();

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Обновить сотрудника
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      phone,
      role,
      department,
      position,
      salary,
      hireDate,
      isActive,
      password,
      notes
    } = body;

    const employee = await User.findById(params.id);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Проверка уникальности email (если изменяется)
    if (email && email !== employee.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: params.id } });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Валидация роли
    const validRoles = ['admin', 'manager', 'employee', 'user'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Подготовка данных для обновления
    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: session.user.id
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (position !== undefined) updateData.position = position;
    if (salary !== undefined) updateData.salary = salary;
    if (hireDate !== undefined) updateData.hireDate = new Date(hireDate);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (notes !== undefined) updateData.notes = notes;

    // Обновление пароля (если предоставлен)
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedEmployee = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      employee: updatedEmployee,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить сотрудника (деактивировать)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const permanent = searchParams.get('permanent') === 'true';

    const employee = await User.findById(params.id);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Нельзя удалить самого себя
    if (employee._id.toString() === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      );
    }

    if (permanent) {
      // Постоянное удаление (только для неактивных пользователей)
      if (employee.isActive) {
        return NextResponse.json(
          { error: 'Cannot permanently delete active employee. Deactivate first.' },
          { status: 400 }
        );
      }
      
      await User.findByIdAndDelete(params.id);
      
      return NextResponse.json({
        success: true,
        message: 'Employee permanently deleted'
      });
    } else {
      // Деактивация
      const updatedEmployee = await User.findByIdAndUpdate(
        params.id,
        {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: session.user.id,
          updatedAt: new Date()
        },
        { new: true }
      ).select('-password');

      return NextResponse.json({
        success: true,
        employee: updatedEmployee,
        message: 'Employee deactivated successfully'
      });
    }
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}