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
import { AlertTriangle } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const EmployeeDeleteDialog: React.FC<EmployeeDeleteDialogProps> = ({
  open,
  onOpenChange,
  employee,
  onConfirm,
  onCancel
}) => {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle>Удалить сотрудника</DialogTitle>
          </div>
          <DialogDescription>
            Вы уверены, что хотите удалить сотрудника <strong>{employee.name}</strong>?
            Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Внимание!
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  После удаления сотрудника:
                </p>
                <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                  <li>Все данные будут безвозвратно удалены</li>
                  <li>Доступ к системе будет заблокирован</li>
                  <li>История активности будет сохранена</li>
                </ul>
              </div>
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
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
          >
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};