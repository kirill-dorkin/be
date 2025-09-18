'use client';

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
  DollarSign,
  MoreHorizontal,
  Edit,
  Package,
  Calendar,
  Percent,
} from 'lucide-react';
import { IProduct } from '@/models/Product';

interface ProductsTableProps {
  products: IProduct[];
  loading: boolean;
  onEditPrice: (product: IProduct) => void;
}

export const ProductsTable = ({ products, loading, onEditPrice }: ProductsTableProps) => {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Товар</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Текущая цена</TableHead>
              <TableHead>Скидка</TableHead>
              <TableHead>Последнее обновление</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Товар</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Текущая цена</TableHead>
              <TableHead>Скидка</TableHead>
              <TableHead>Последнее обновление</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Package className="h-8 w-8 text-gray-400" />
                  <p className="text-gray-500">Товары не найдены</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Товар</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Текущая цена</TableHead>
            <TableHead>Скидка</TableHead>
            <TableHead>Последнее обновление</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id?.toString()}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {product.category || 'Без категории'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {product.price?.toLocaleString('ru-RU') || 0} ₽
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {(product as any).discount ? (
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">
                      {(product as any).discount}%
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">Нет</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {(product as any).updatedAt ? 
                    new Date((product as any).updatedAt).toLocaleDateString('ru-RU') : 
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
                    <DropdownMenuItem onClick={() => onEditPrice(product)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Изменить цену
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};