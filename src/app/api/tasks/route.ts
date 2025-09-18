import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');

    // Построение фильтра
    interface TaskFilter {
      status?: string;
      priority?: string;
      assignedTo?: string;
      $or?: Array<{
        title?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
      }>;
    }
    
    const filter: TaskFilter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Подсчет общего количества
    const totalCount = await Task.countDocuments(filter);
    
    // Получение задач с пагинацией
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Статистика по статусам
    const statusStats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: totalCount,
      pending: statusStats.find(s => s._id === 'Pending')?.count || 0,
      inProgress: statusStats.find(s => s._id === 'In Progress')?.count || 0,
      completed: statusStats.find(s => s._id === 'Completed')?.count || 0
    };

    return NextResponse.json({
      success: true,
      tasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { title, description, status, priority, assignedTo, dueDate } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const newTask = new Task({
      title,
      description,
      status: status || 'Pending',
      priority: priority || 'Medium',
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: session.user.id
    });

    await newTask.save();

    return NextResponse.json({
      success: true,
      task: newTask,
      message: 'Task created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}