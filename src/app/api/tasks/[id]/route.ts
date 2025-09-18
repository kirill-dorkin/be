import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import mongoose from 'mongoose';

// GET - Получить конкретную задачу
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const task = await Task.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Обновить задачу
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'worker')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, status, priority, assignedTo, dueDate } = body;

    const existingTask = await Task.findById(id);
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Проверка прав: админ может редактировать все, работник только назначенные ему
    if (session.user.role === 'worker' && 
        existingTask.assignedTo?.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit tasks assigned to you' },
        { status: 403 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить задачу
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete tasks' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const deletedTask = await Task.findByIdAndDelete(id);
    
    if (!deletedTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}