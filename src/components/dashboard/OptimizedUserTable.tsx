'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RiEyeLine, RiEditLine, RiDeleteBinLine, RiUserLine } from 'react-icons/ri';
import EnhancedTable from './EnhancedTable';

interface TableRow {
  [key: string]: unknown;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  [key: string]: unknown;
}

interface OptimizedUserTableProps {
  users: User[];
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

const OptimizedUserTable: React.FC<OptimizedUserTableProps> = ({
  users,
  onView,
  onEdit,
  onDelete,
  loading = false,
  onRefresh
}) => {
  const t = useTranslations();
  
  // Определение колонок
  const columns = [
    {
      key: 'avatar',
      title: '',
      width: 'w-12',
      render: (value: unknown, row: TableRow) => {
        const user = row as User;
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || ''} alt={user.name} />
            <AvatarFallback>
              {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        );
      }
    },
    {
      key: 'name',
      title: t('users.table.name'),
      sortable: true,
      filterable: true,
      render: (value: unknown, row: TableRow) => {
        const user = row as User;
        return (
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        );
      }
    },
    {
      key: 'role',
      title: t('users.table.role'),
      sortable: true,
      filterable: true,
      render: (value: unknown, row: TableRow) => {
        const getRoleColor = (role: string) => {
          switch (role.toLowerCase()) {
            case 'admin':
              return 'bg-red-100 text-red-800';
            case 'manager':
              return 'bg-blue-100 text-blue-800';
            case 'user':
              return 'bg-green-100 text-green-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };
        
        const user = row as User;
        return (
          <Badge className={getRoleColor(user.role)}>
            {user.role}
          </Badge>
        );
      }
    },
    {
      key: 'status',
      title: t('users.table.status'),
      sortable: true,
      filterable: true,
      render: (value: unknown, row: TableRow) => {
        const user = row as User;
        return (
          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
            {user.status === 'active' ? t('users.status.active') : t('users.status.inactive')}
          </Badge>
        );
      }
    },
    {
      key: 'lastLogin',
      title: t('users.table.lastLogin'),
      sortable: true,
      render: (value: unknown, row: TableRow) => {
        const user = row as User;
        if (!user.lastLogin) return <span className="text-gray-400">{t('users.table.never')}</span>;
        
        const date = new Date(user.lastLogin);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          return <span className="text-green-600">{t('common.today')}</span>;
        } else if (diffDays <= 7) {
          return <span className="text-blue-600">{diffDays} дн. назад</span>;
        } else {
          return <span className="text-gray-600">{date.toLocaleDateString('ru-RU')}</span>;
        }
      }
    },
    {
      key: 'createdAt',
      title: t('users.table.registrationDate'),
      sortable: true,
      render: (value: unknown, row: TableRow) => {
        const user = row as User;
        const date = new Date(user.createdAt);
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString('ru-RU')}</div>
            <div className="text-gray-500">{date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        );
      }
    }
  ];

  // Определение действий
  const actions = [
    {
      key: 'view',
      label: t('common.actions.view'),
      icon: <RiEyeLine className="w-4 h-4" />,
      onClick: (row: TableRow) => onView?.(row as User)
    },
    {
      key: 'edit',
      label: t('common.actions.edit'),
      icon: <RiEditLine className="w-4 h-4" />,
      onClick: (row: TableRow) => onEdit?.(row as User)
    },
    {
      key: 'delete',
      label: t('common.actions.delete'),
      icon: <RiDeleteBinLine className="w-4 h-4" />,
      onClick: (row: TableRow) => onDelete?.(row as User),
      variant: 'destructive' as const,
      condition: (row: TableRow) => (row as User).role !== 'admin' // Нельзя удалить админа
    }
  ].filter(action => {
    // Фильтруем действия в зависимости от переданных обработчиков
    if (action.key === 'view' && !onView) return false;
    if (action.key === 'edit' && !onEdit) return false;
    if (action.key === 'delete' && !onDelete) return false;
    return true;
  });

  return (
    <EnhancedTable
      data={users}
      columns={columns}
      actions={actions}
      title={t('users.title')}
      searchable={true}
      exportable={true}
      refreshable={!!onRefresh}
      onRefresh={onRefresh}
      loading={loading}
      emptyMessage={t('users.table.noUsersFound')}
      pageSize={15}
      className="w-full"
    />
  );
};

export default OptimizedUserTable;