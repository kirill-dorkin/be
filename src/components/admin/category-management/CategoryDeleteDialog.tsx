import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ICategory } from '@/models/Category';

interface CategoryDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: ICategory | null;
}

export const CategoryDeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  category
}: CategoryDeleteDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить категорию "{category?.name}"? 
            Это действие нельзя отменить и может повлиять на связанные услуги и товары.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};