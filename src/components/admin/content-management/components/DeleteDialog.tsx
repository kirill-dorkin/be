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
import { Trash2 } from 'lucide-react';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteDialog({ 
  open, 
  onClose, 
  onConfirm, 
  loading = false 
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Удалить страницу
          </AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить эту страницу? Это действие нельзя отменить.
            Все данные страницы будут безвозвратно удалены.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Удаление...' : 'Удалить'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}