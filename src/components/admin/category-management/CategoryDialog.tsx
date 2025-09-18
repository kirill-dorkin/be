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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CategoryFormData } from './types';
import { ICategory } from '@/models/Category';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: CategoryFormData;
  setFormData: (data: CategoryFormData) => void;
  title: string;
  description: string;
  submitLabel: string;
  category?: ICategory | null;
}

export const CategoryDialog = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  title,
  description,
  submitLabel,
  category
}: CategoryDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Название</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="col-span-3"
              placeholder="Введите название категории"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-3"
              placeholder="Введите описание категории (необязательно)"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button onClick={onSubmit}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};