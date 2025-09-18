import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Edit,
  Trash2,
  Eye,
  Globe,
  Lock,
  Calendar,
  User,
  MoreHorizontal,
  Copy,
  Download
} from 'lucide-react';
import { ContentPage, STATUS_OPTIONS } from '../types';

interface ContentTableProps {
  pages: ContentPage[];
  selectedPages: string[];
  onPageSelect: (pageId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onEdit: (page: ContentPage) => void;
  onDelete: (pageId: string) => void;
  loading?: boolean;
}

export function ContentTable({
  pages,
  selectedPages,
  onPageSelect,
  onSelectAll,
  onClearSelection,
  onEdit,
  onDelete,
  loading = false
}: ContentTableProps) {
  const [sortField, setSortField] = useState<keyof ContentPage>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof ContentPage) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPages = [...pages].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const getStatusBadge = (status: ContentPage['status']) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    if (!statusOption) return null;
    
    return (
      <Badge className={statusOption.color}>
        {statusOption.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
  };

  const exportPage = (page: ContentPage) => {
    const dataStr = JSON.stringify(page, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${page.slug}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedPages.length === pages.length && pages.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectAll();
                  } else {
                    onClearSelection();
                  }
                }}
              />
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('title')}
            >
              Название
              {sortField === 'title' && (
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Шаблон</TableHead>
            <TableHead>Автор</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('views')}
            >
              Просмотры
              {sortField === 'views' && (
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('updatedAt')}
            >
              Обновлено
              {sortField === 'updatedAt' && (
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPages.map((page) => (
            <TableRow key={page._id}>
              <TableCell>
                <Checkbox
                  checked={selectedPages.includes(page._id)}
                  onCheckedChange={() => onPageSelect(page._id)}
                />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{page.title}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    {page.isPublic ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    /{page.slug}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(page.status)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {page.template}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{page.author.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span>{page.views.toLocaleString()}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {formatDate(page.updatedAt)}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Действия</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(page)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(`/${page.slug}`)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Копировать ссылку
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportPage(page)}>
                      <Download className="mr-2 h-4 w-4" />
                      Экспорт
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(page._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {pages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Страницы не найдены
        </div>
      )}
    </div>
  );
}