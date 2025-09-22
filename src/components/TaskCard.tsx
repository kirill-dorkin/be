'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cva } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'
import { Clock, User, Calendar } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
  createdAt: string
  updatedAt: string
  dueDate?: string
}

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800'
}

const statusLabels = {
  pending: 'Ожидает',
  in_progress: 'В работе',
  completed: 'Завершено',
  cancelled: 'Отменено'
}

const priorityLabels = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий'
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="flex gap-2 ml-2">
            <Badge className={statusColors[task.status]}>
              {statusLabels[task.status]}
            </Badge>
            <Badge className={priorityColors[task.priority]}>
              {priorityLabels[task.priority]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {task.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="space-y-2 text-sm text-gray-500">
          {task.assignedTo && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{task.assignedTo}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Создано: {formatDate(task.createdAt)}</span>
          </div>
          
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Срок: {formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}