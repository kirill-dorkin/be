'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { RiEyeLine, RiEditLine, RiDeleteBinLine, RiPlayLine, RiPauseLine } from 'react-icons/ri';
import EnhancedTable from './EnhancedTable';

interface TableRow {
  [key: string]: unknown;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  progress: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface OptimizedTaskTableProps {
  tasks: Task[];
  onView?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStart?: (task: Task) => void;
  onPause?: (task: Task) => void;
  loading?: boolean;
  onRefresh?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const OptimizedTaskTable: React.FC<OptimizedTaskTableProps> = ({
  tasks,
  onView,
  onEdit,
  onDelete,
  onStart,
  onPause,
  loading = false,
  onRefresh,
  canEdit = true,
  canDelete = true
}) => {
  
  // Определение колонок
  const columns = [
    {
      key: 'title',
      title: 'Задача',
      sortable: true,
      filterable: true,
      width: 'min-w-[200px]',
      render: (value: unknown, row: TableRow) => (
        <div>
          <div className="font-medium text-sm">{(row as Task).title}</div>
          {(row as Task).description && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
              {(row as Task).description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Статус',
      sortable: true,
      filterable: true,
      render: (value: unknown, row: TableRow) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'pending':
              return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
              return 'bg-blue-100 text-blue-800';
            case 'completed':
              return 'bg-green-100 text-green-800';
            case 'cancelled':
              return 'bg-red-100 text-red-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };
        
        const getStatusText = (status: string) => {
          switch (status) {
            case 'pending':
              return 'В ожидании';
            case 'in_progress':
              return 'В процессе';
            case 'completed':
              return 'Завершено';
            case 'cancelled':
              return 'Отменено';
            default:
              return status;
          }
        };
        
        return (
          <Badge className={getStatusColor((row as Task).status)}>
            {getStatusText((row as Task).status)}
          </Badge>
        );
      }
    },
    {
      key: 'priority',
      title: 'Приоритет',
      sortable: true,
      filterable: true,
      render: (value: unknown, row: TableRow) => {
        const getPriorityColor = (priority: string) => {
          switch (priority) {
            case 'urgent':
              return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
              return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
              return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
              return 'bg-green-100 text-green-800 border-green-200';
            default:
              return 'bg-gray-100 text-gray-800 border-gray-200';
          }
        };
        
        const getPriorityText = (priority: string) => {
          switch (priority) {
            case 'urgent':
              return 'Срочно';
            case 'high':
              return 'Высокий';
            case 'medium':
              return 'Средний';
            case 'low':
              return 'Низкий';
            default:
              return priority;
          }
        };
        
        return (
          <Badge variant="outline" className={getPriorityColor((row as Task).priority)}>
            {getPriorityText((row as Task).priority)}
          </Badge>
        );
      }
    },
    {
      key: 'assignee',
      title: 'Исполнитель',
      sortable: true,
      filterable: true,
      render: (value: unknown, row: TableRow) => {
        if (!(row as Task).assignee) {
          return <span className="text-gray-400 text-sm">Не назначен</span>;
        }
        
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={(row as Task).assignee!.avatar || ''} alt={(row as Task).assignee!.name} />
              <AvatarFallback className="text-xs">
                {(row as Task).assignee!.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{(row as Task).assignee!.name}</span>
          </div>
        );
      }
    },
    {
      key: 'progress',
      title: 'Прогресс',
      sortable: true,
      render: (value: unknown, row: TableRow) => (
        <div className="w-full max-w-[100px]">
          <div className="flex items-center gap-2">
            <Progress value={(row as Task).progress} className="flex-1" />
            <span className="text-xs text-gray-600 min-w-[30px]">{(row as Task).progress}%</span>
          </div>
        </div>
      )
    },
    {
      key: 'dueDate',
      title: 'Срок выполнения',
      sortable: true,
      render: (value: unknown, row: TableRow) => {
        if (!(row as Task).dueDate) {
          return <span className="text-gray-400 text-sm">Не установлен</span>;
        }
        
        const dueDate = new Date((row as Task).dueDate!);
        const now = new Date();
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let colorClass = 'text-gray-600';
        let text = dueDate.toLocaleDateString('ru-RU');
        
        if (diffDays < 0) {
          colorClass = 'text-red-600';
          text = `Просрочено на ${Math.abs(diffDays)} дн.`;
        } else if (diffDays === 0) {
          colorClass = 'text-orange-600';
          text = 'Сегодня';
        } else if (diffDays === 1) {
          colorClass = 'text-yellow-600';
          text = 'Завтра';
        } else if (diffDays <= 3) {
          colorClass = 'text-yellow-600';
          text = `Через ${diffDays} дн.`;
        }
        
        return (
          <div className={`text-sm ${colorClass}`}>
            {text}
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Создано',
      sortable: true,
      render: (value: unknown, row: TableRow) => {
        const date = new Date((row as Task).createdAt);
        return (
          <div className="text-sm text-gray-600">
            {date.toLocaleDateString('ru-RU')}
          </div>
        );
      }
    }
  ];

  // Определение действий
  const actions = [
    {
      key: 'view',
      label: 'Просмотр',
      icon: <RiEyeLine className="w-4 h-4" />,
      onClick: (row: TableRow) => onView?.(row as Task)
    },
    {
      key: 'start',
      label: 'Запустить',
      icon: <RiPlayLine className="w-4 h-4" />,
      onClick: (row: TableRow) => onStart?.(row as Task),
      condition: (row: TableRow) => (row as Task).status === 'pending' && !!onStart
    },
    {
      key: 'pause',
      label: 'Приостановить',
      icon: <RiPauseLine className="w-4 h-4" />,
      onClick: (row: TableRow) => onPause?.(row as Task),
      condition: (row: TableRow) => (row as Task).status === 'in_progress' && !!onPause
    },
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <RiEditLine className="w-4 h-4" />,
      onClick: (row: TableRow) => onEdit?.(row as Task),
      condition: () => canEdit && !!onEdit
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <RiDeleteBinLine className="w-4 h-4" />,
      onClick: (row: TableRow) => onDelete?.(row as Task),
      variant: 'destructive' as const,
      condition: (row: TableRow) => canDelete && (row as Task).status !== 'in_progress' && !!onDelete
    }
  ].filter(action => {
    // Фильтруем действия в зависимости от переданных обработчиков
    if (action.key === 'view' && !onView) return false;
    if (action.key === 'edit' && (!onEdit || !canEdit)) return false;
    if (action.key === 'delete' && (!onDelete || !canDelete)) return false;
    if (action.key === 'start' && !onStart) return false;
    if (action.key === 'pause' && !onPause) return false;
    return true;
  });

  return (
    <EnhancedTable
      data={tasks}
      columns={columns}
      actions={actions}
      title={'Задачи'}
      searchable={true}
      exportable={true}
      refreshable={!!onRefresh}
      onRefresh={onRefresh}
      loading={loading}
      emptyMessage={'Задачи не найдены'}
      pageSize={12}
      className="w-full"
    />
  );
};

export default OptimizedTaskTable;