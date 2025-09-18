import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FolderOpen,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Hash
} from 'lucide-react';
import { ICategory } from '@/models/Category';

interface CategoryTableProps {
  categories: ICategory[];
  loading: boolean;
  onView: (category: ICategory) => void;
  onEdit: (category: ICategory) => void;
  onDelete: (category: ICategory) => void;
}

export const CategoryTable = ({ 
  categories, 
  loading, 
  onView, 
  onEdit, 
  onDelete 
}: CategoryTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Категория</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead>Последнее обновление</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <FolderOpen className="h-8 w-8 text-gray-400" />
                  <p className="text-gray-500">Категории не найдены</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category._id?.toString()}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-mono">
                      {category._id?.toString().slice(-8)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Активная
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {(category as any).createdAt ? 
                      new Date((category as any).createdAt).toLocaleDateString('ru-RU') : 
                      'Не указано'
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {(category as any).updatedAt ? 
                      new Date((category as any).updatedAt).toLocaleDateString('ru-RU') : 
                      'Не указано'
                    }
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Действия</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onView(category)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Просмотр
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(category)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};