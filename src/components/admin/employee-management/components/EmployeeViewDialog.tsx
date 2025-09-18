import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Employee } from '../types';

interface EmployeeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
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

export const EmployeeViewDialog: React.FC<EmployeeViewDialogProps> = ({
  open,
  onOpenChange,
  employee
}) => {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Информация о сотруднике</DialogTitle>
          <DialogDescription>
            Подробная информация о сотруднике {employee.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
              {employee.image ? (
                <img
                  src={employee.image}
                  alt={employee.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-medium text-gray-600">
                  {employee.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{employee.name}</h3>
              <p className="text-gray-600">{employee.email}</p>
              <Badge className={getRoleBadgeColor(employee.role)}>
                {getRoleLabel(employee.role)}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">ID</Label>
              <p className="text-sm">{employee._id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Роль</Label>
              <p className="text-sm">{getRoleLabel(employee.role)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Дата создания</Label>
              <p className="text-sm">
                {formatDate((employee as any).createdAt)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Последнее обновление</Label>
              <p className="text-sm">
                {formatDate((employee as any).updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};