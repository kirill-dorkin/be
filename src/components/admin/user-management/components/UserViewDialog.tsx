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
import { Separator } from '@/components/ui/separator';
import { User } from '../types';
// Utility function for date formatting
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface UserViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onEdit?: () => void;
  onClose: () => void;
}

export const UserViewDialog = ({
  open,
  onOpenChange,
  user,
  onEdit,
  onClose
}: UserViewDialogProps) => {
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Активный', variant: 'default' as const, icon: CheckCircle },
      inactive: { label: 'Неактивный', variant: 'secondary' as const, icon: XCircle },
      suspended: { label: 'Заблокирован', variant: 'destructive' as const, icon: XCircle },
      pending: { label: 'Ожидает', variant: 'outline' as const, icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getVerificationBadge = (status: string) => {
    const verificationConfig = {
      verified: { label: 'Подтвержден', variant: 'default' as const, icon: CheckCircle },
      pending: { label: 'Ожидает подтверждения', variant: 'outline' as const, icon: Clock },
      rejected: { label: 'Отклонен', variant: 'destructive' as const, icon: XCircle }
    };
    
    const config = verificationConfig[status as keyof typeof verificationConfig] || verificationConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Информация о пользователе
          </DialogTitle>
          <DialogDescription>
            Подробная информация о пользователе {user.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Основная информация</h3>
              <div className="flex gap-2">
                {getStatusBadge(user.status)}
                {getVerificationBadge(user.verificationStatus)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  Имя
                </div>
                <p className="font-medium">{user.name}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Роль
                </div>
                <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
              </div>
              
              {user.phone && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Телефон
                  </div>
                  <p className="font-medium">{user.phone}</p>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Адрес */}
          {(user.address?.street || user.address?.city || user.address?.country) && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Адрес
                </h3>
                
                <div className="space-y-2">
                  {user.address?.street && <p>{user.address.street}</p>}
                  <div className="flex gap-2">
                    {user.address?.city && <span>{user.address.city}</span>}
                    {user.address?.zipCode && <span>{user.address.zipCode}</span>}
                  </div>
                  {user.address?.country && <p>{user.address.country}</p>}
                </div>
              </div>
              
              <Separator />
            </>
          )}
          
          {/* Настройки */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Настройки</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Подписка на рассылку</span>
                {user.preferences?.newsletter ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Уведомления</span>
                {user.preferences?.notifications ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Даты */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Временные метки
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Дата регистрации:</span>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
              
              <div>
                <span className="text-muted-foreground">Последнее обновление:</span>
                <p className="font-medium">{formatDate(user.updatedAt)}</p>
              </div>
              
              {user.lastLoginAt && (
                <div>
                  <span className="text-muted-foreground">Последний вход:</span>
                  <p className="font-medium">{formatDate(user.lastLoginAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              Редактировать
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};