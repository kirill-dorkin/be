import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  Activity,
  Eye,
  Users
} from 'lucide-react';
import { User, UserPagination } from '../types';

interface UserTableProps {
  users: User[];
  loading: boolean;
  selectedUsers: string[];
  pagination: UserPagination;
  onUserSelect: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onToggleUserStatus: (user: User) => void;
  onPageChange: (page: number) => void;
}

export const UserTable = ({
  users,
  loading,
  selectedUsers,
  pagination,
  onUserSelect,
  onSelectAll,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onToggleUserStatus,
  onPageChange
}: UserTableProps) => {
  // Получение статуса роли
  const getRoleStatus = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Администратор', variant: 'destructive' as const, icon: ShieldCheck };
      case 'moderator':
        return { label: 'Модератор', variant: 'secondary' as const, icon: Shield };
      case 'worker':
        return { label: 'Сотрудник', variant: 'outline' as const, icon: Users };
      default:
        return { label: 'Пользователь', variant: 'default' as const, icon: Users };
    }
  };

  // Получение статуса активности
  const getActivityStatus = (isActive: boolean) => {
    return isActive
      ? { label: 'Активен', variant: 'default' as const, icon: UserCheck }
      : { label: 'Заблокирован', variant: 'destructive' as const, icon: UserX };
  };

  // Форматирование даты
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Таблица пользователей */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead>Пользователь</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Email подтвержден</TableHead>
              <TableHead>Последний вход</TableHead>
              <TableHead>Дата регистрации</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Загрузка...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Пользователи не найдены
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const roleStatus = getRoleStatus(user.role);
                const activityStatus = getActivityStatus(user.isActive);
                const RoleIcon = roleStatus.icon;
                const ActivityIcon = activityStatus.icon;
                
                return (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user._id)}
                        onCheckedChange={(checked) => onUserSelect(user._id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleStatus.variant} className="flex items-center gap-1 w-fit">
                        <RoleIcon className="h-3 w-3" />
                        {roleStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={activityStatus.variant} className="flex items-center gap-1 w-fit">
                        <ActivityIcon className="h-3 w-3" />
                        {activityStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                          <Mail className="h-3 w-3" />
                          Подтвержден
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <Mail className="h-3 w-3" />
                          Не подтвержден
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-green-600" />
                          <span className="text-sm">{formatDate(user.lastLogin)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Никогда</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(user.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onViewUser(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Просмотр
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onToggleUserStatus(user)}>
                            {user.isActive ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Заблокировать
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Активировать
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Пагинация */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Страница {pagination.currentPage} из {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || loading}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages || loading}
            >
              Вперед
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};