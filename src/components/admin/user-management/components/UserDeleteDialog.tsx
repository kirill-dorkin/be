import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '../types';
import { AlertTriangle, User as UserIcon, Mail, Shield } from 'lucide-react';

interface UserDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const UserDeleteDialog = ({
  open,
  onOpenChange,
  user,
  onConfirm,
  onCancel,
  isDeleting = false
}: UserDeleteDialogProps) => {
  if (!user) return null;

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      user: 'Пользователь',
      worker: 'Сотрудник',
      moderator: 'Модератор',
      admin: 'Администратор'
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  const isAdminUser = user.role === 'admin';
  const isCurrentUser = false; // TODO: Add logic to check if this is current user

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Удалить пользователя
          </DialogTitle>
          <DialogDescription>
            Это действие нельзя отменить. Пользователь будет удален навсегда.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Информация о пользователе */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{user.name}</h3>
                  <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Предупреждения */}
          <div className="space-y-3">
            {isAdminUser && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <div className="flex items-center gap-2 text-destructive">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium text-sm">Внимание: Администратор</span>
                </div>
                <p className="text-sm text-destructive/80 mt-1">
                  Вы удаляете пользователя с правами администратора. Убедитесь, что это необходимо.
                </p>
              </div>
            )}
            
            {isCurrentUser && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium text-sm">Внимание: Текущий пользователь</span>
                </div>
                <p className="text-sm text-destructive/80 mt-1">
                  Вы пытаетесь удалить свою собственную учетную запись. Это приведет к выходу из системы.
                </p>
              </div>
            )}
            
            <div className="rounded-lg bg-muted/50 p-3">
              <h4 className="font-medium text-sm mb-2">Что будет удалено:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Профиль пользователя и все личные данные</li>
                <li>• История активности и логи</li>
                <li>• Связанные настройки и предпочтения</li>
                {user.stats && user.stats.ordersCount > 0 && (
                  <li>• История заказов ({user.stats.ordersCount} заказов)</li>
                )}
                {user.stats && user.stats.tasksCount && user.stats.tasksCount > 0 && (
                  <li>• Связанные задачи ({user.stats.tasksCount} задач)</li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Подтверждение */}
          <div className="rounded-lg border-2 border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-center">
              Введите имя пользователя для подтверждения:
            </p>
            <p className="text-center font-mono text-sm mt-1 px-2 py-1 bg-muted rounded">
              {user.name}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить пользователя'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};