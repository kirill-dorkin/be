import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Employee, EmployeeFormData } from '../types';

interface EmployeeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  formData: EmployeeFormData;
  onFormDataChange: (data: Partial<EmployeeFormData>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const EmployeeEditDialog: React.FC<EmployeeEditDialogProps> = ({
  open,
  onOpenChange,
  employee,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать сотрудника</DialogTitle>
          <DialogDescription>
            Обновите информацию о сотруднике {employee?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">Имя</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ name: e.target.value })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-email" className="text-right">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => onFormDataChange({ email: e.target.value })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-phone" className="text-right">Телефон</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) => onFormDataChange({ phone: e.target.value })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-position" className="text-right">Должность</Label>
            <Input
              id="edit-position"
              value={formData.position}
              onChange={(e) => onFormDataChange({ position: e.target.value })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-role" className="text-right">Роль</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'worker' | 'user') => 
                onFormDataChange({ role: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Пользователь</SelectItem>
                <SelectItem value="worker">Сотрудник</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Статус</Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => 
                  onFormDataChange({ isActive: !!checked })
                }
              />
              <Label htmlFor="edit-isActive">Активный сотрудник</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Отмена
          </Button>
          <Button onClick={onSubmit}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};