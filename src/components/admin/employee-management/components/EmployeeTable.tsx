import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Calendar,
  Eye
} from 'lucide-react';
import { Employee, EmployeePagination } from '../types';

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  pagination: EmployeePagination;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onPageChange: (page: number) => void;
}

// Утилитарные функции
const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'worker':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'user':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin':
      return 'Администратор';
    case 'worker':
      return 'Сотрудник';
    case 'user':
      return 'Пользователь';
    default:
      return role;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Не указано';
  return new Date(dateString).toLocaleDateString('ru-RU');
};

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading,
  pagination,
  onView,
  onEdit,
  onDelete,
  onPageChange
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Сотрудник</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-gray-400" />
                    <p className="text-gray-500">Сотрудники не найдены</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee._id?.toString() || `employee-${Math.random()}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {employee.image ? (
                          <img
                            src={employee.image}
                            alt={employee.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {employee.name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {employee.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(employee.role)}>
                      {getRoleLabel(employee.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Активный
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate((employee as any).createdAt)}
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(employee)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Просмотр
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(employee)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
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