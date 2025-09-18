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
import { UserFormData } from '../types';

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UserFormData;
  onFormDataChange: (data: UserFormData | ((prev: UserFormData) => UserFormData)) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const UserEditDialog = ({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel
}: UserEditDialogProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя</DialogTitle>
          <DialogDescription>
            Внесите изменения в данные пользователя
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Имя</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Новый пароль</Label>
              <Input
                id="password"
                type="password"
                value={formData.password || ''}
                onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
                className="col-span-3"
                placeholder="Оставьте пустым, чтобы не изменять"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Роль</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'user' | 'admin' | 'moderator' | 'worker') => 
                  onFormDataChange({ ...formData, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="worker">Сотрудник</SelectItem>
                  <SelectItem value="moderator">Модератор</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Адрес</Label>
              <div className="col-span-3 space-y-2">
                <Input
                  placeholder="Улица"
                  value={formData.address.street}
                  onChange={(e) => onFormDataChange({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Город"
                    value={formData.address.city}
                    onChange={(e) => onFormDataChange({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Почтовый код"
                    value={formData.address.zipCode}
                    onChange={(e) => onFormDataChange({
                      ...formData,
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
                  />
                </div>
                <Input
                  placeholder="Страна"
                  value={formData.address.country}
                  onChange={(e) => onFormDataChange({
                    ...formData,
                    address: { ...formData.address, country: e.target.value }
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Настройки</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => onFormDataChange({ ...formData, isActive: !!checked })}
                  />
                  <Label htmlFor="isActive">Активный пользователь</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={formData.preferences.newsletter}
                    onCheckedChange={(checked) => onFormDataChange({
                      ...formData,
                      preferences: { ...formData.preferences, newsletter: !!checked }
                    })}
                  />
                  <Label htmlFor="newsletter">Подписка на рассылку</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifications"
                    checked={formData.preferences.notifications}
                    onCheckedChange={(checked) => onFormDataChange({
                      ...formData,
                      preferences: { ...formData.preferences, notifications: !!checked }
                    })}
                  />
                  <Label htmlFor="notifications">Уведомления</Label>
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
            <Button type="submit">
              Сохранить изменения
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};