import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FolderOpen } from 'lucide-react';
import { ICategory } from '@/models/Category';

interface CategoryViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: ICategory | null;
}

export const CategoryViewDialog = ({
  isOpen,
  onClose,
  category
}: CategoryViewDialogProps) => {
  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Информация о категории</DialogTitle>
          <DialogDescription>
            Подробная информация о категории {category.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded bg-blue-100 flex items-center justify-center">
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Активная
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">ID</Label>
              <p className="text-sm font-mono">{category._id?.toString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Название</Label>
              <p className="text-sm">{category.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Дата создания</Label>
              <p className="text-sm">
                {(category as any).createdAt ? 
                  new Date((category as any).createdAt).toLocaleDateString('ru-RU') : 
                  'Не указано'
                }
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Последнее обновление</Label>
              <p className="text-sm">
                {(category as any).updatedAt ? 
                  new Date((category as any).updatedAt).toLocaleDateString('ru-RU') : 
                  'Не указано'
                }
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};