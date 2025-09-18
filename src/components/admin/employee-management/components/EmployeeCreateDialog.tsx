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
import { EmployeeFormData } from '../types';

interface EmployeeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: EmployeeFormData;
  onFormDataChange: (data: Partial<EmployeeFormData>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const EmployeeCreateDialog: React.FC<EmployeeCreateDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавить нового сотрудника</DialogTitle>
          <DialogDescription>
            Заполните информацию о новом сотруднике
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Имя</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ name: e.target.value })}
              className="col-span-3"
              placeholder="Введите имя"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFormDataChange({ email: e.target.value })}
              className="col-span-3"
              placeholder="Введите email"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Телефон</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => onFormDataChange({ phone: e.target.value })}
              className="col-span-3"
              placeholder="Введите телефон"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">Должность</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => onFormDataChange({ position: e.target.value })}
              className="col-span-3"
              placeholder="Введите должность"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Роль</Label>
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
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => 
                  onFormDataChange({ isActive: !!checked })
                }
              />
              <Label htmlFor="isActive">Активный сотрудник</Label>
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
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};