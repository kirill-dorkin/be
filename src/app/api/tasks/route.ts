import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/shared/lib/dbConnect'
import { Task } from '@/types'

// Простой API для тестирования без авторизации
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Возвращаем тестовые данные
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Тестовая задача 1',
        description: 'Описание первой задачи',
        status: 'pending',
        priority: 'medium',
        assignedTo: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date(),
        clientName: 'Тестовый клиент',
        deviceType: 'Ноутбук',
        issueDescription: 'Проблема с экраном'
      },
      {
        id: '2',
        title: 'Тестовая задача 2',
        description: 'Описание второй задачи',
        status: 'in_progress',
        priority: 'high',
        assignedTo: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date(),
        clientName: 'Другой клиент',
        deviceType: 'Планшет',
        issueDescription: 'Не включается'
      }
    ]

    return NextResponse.json({ success: true, data: tasks })
  } catch (error) {
    console.error('Ошибка получения задач:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await connectToDatabase()
    
    // Простое создание задачи для тестирования
    const newTask: Task = {
      id: Date.now().toString(),
      title: body.title || 'Новая задача',
      description: body.description || '',
      status: 'pending',
      priority: body.priority || 'medium',
      assignedTo: body.assignedTo || 'unassigned',
      createdAt: new Date(),
      updatedAt: new Date(),
      clientName: body.clientName,
      deviceType: body.deviceType,
      issueDescription: body.issueDescription
    }

    return NextResponse.json({ success: true, data: newTask }, { status: 201 })
  } catch (error) {
    console.error('Ошибка создания задачи:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}