'use client';

import React, { useState, useMemo, useCallback } from 'react';

import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RiSearchLine,
  RiFilterLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiRefreshLine,
  RiDownloadLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiMoreLine
} from 'react-icons/ri';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TableRow {
  [key: string]: unknown;
}

interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: unknown, row: TableRow) => React.ReactNode;
}

interface Action {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: (row: TableRow) => void;
  variant?: 'default' | 'destructive' | 'outline';
  condition?: (row: TableRow) => boolean;
}

interface EnhancedTableProps {
  data: TableRow[];
  columns: Column[];
  actions?: Action[];
  title?: string;
  searchable?: boolean;
  exportable?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

const EnhancedTable: React.FC<EnhancedTableProps> = ({
  data,
  columns,
  actions = [],
  title,
  searchable = true,
  exportable = false,
  refreshable = false,
  onRefresh,
  loading = false,
  emptyMessage,
  pageSize = 10,
  className = ''
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Фильтрация данных
  const filteredData = useMemo(() => {
    let result = [...data];

    // Поиск
    if (searchTerm) {
      result = result.filter(row => 
        columns.some(column => {
          const value = row[column.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Фильтры по колонкам
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row => {
          const cellValue = row[key];
          return cellValue && cellValue.toString().toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    return result;
  }, [data, searchTerm, filters, columns]);

  // Сортировка данных
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;
      
      const aStr = String(aValue || '');
      const bStr = String(bValue || '');
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Пагинация
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / Number(pageSize));

  // Обработка сортировки
  const handleSort = useCallback((columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => 
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);

  // Экспорт данных
  const handleExport = useCallback(() => {
    const csvContent = [
      columns.map(col => col.title).join(','),
      ...sortedData.map(row => 
        columns.map(col => {
          const value = row[col.key];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title || 'table'}_export.csv`;
    link.click();
  }, [sortedData, columns, title]);

  // Рендер иконки сортировки
  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return null;
    return sortDirection === 'asc' ? 
      <RiArrowUpLine className="w-4 h-4 ml-1" /> : 
      <RiArrowDownLine className="w-4 h-4 ml-1" />;
  };

  return (
    <Card className={`w-full ${className}`}>
      {(title || searchable || exportable || refreshable) && (
        <CardHeader className="p-3 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
            {title && (
              <CardTitle className="text-lg md:text-xl font-semibold">{title}</CardTitle>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              {searchable && (
                <div className="relative flex-1 sm:flex-none">
                  <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                {refreshable && (
                  <Button
                    variant="outline"
  
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RiRefreshLine className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Обновить
                  </Button>
                )}
                
                {exportable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="flex items-center gap-2"
                  >
                    <RiDownloadLine className="w-4 h-4" />
                    Экспорт
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        {/* Фильтры по колонкам */}
        {columns.some(col => col.filterable) && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {columns.filter(col => col.filterable).map(column => (
              <div key={column.key} className="relative">
                <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Фильтр по ${column.title.toLowerCase()}`}
                  value={filters[column.key] || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, [column.key]: e.target.value }))}
                  className="pl-10"
                />
              </div>
            ))}
          </div>
        )}

        {/* Таблица */}
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {columns.map((column) => (
                    <TableHead 
                      key={column.key}
                      className={`${column.width || ''} ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''} px-3 md:px-4 whitespace-nowrap`}
                      onClick={column.sortable ? () => handleSort(column.key) : undefined}
                    >
                      <div className="flex items-center">
                        <span className="truncate">{column.title}</span>
                        {column.sortable && renderSortIcon(column.key)}
                      </div>
                    </TableHead>
                  ))}
                  {actions.length > 0 && (
                    <TableHead className="text-right w-20 md:w-24 px-3 md:px-4">Действия</TableHead>
                  )}
                </TableRow>
              </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <RiRefreshLine className="w-4 h-4 animate-spin" />
                      Загрузка...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8 text-gray-500">
                    {emptyMessage || 'Нет данных'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <TableCell key={column.key} className={`${column.width || ''} px-3 md:px-4`}>
                        <div className="truncate max-w-[120px] md:max-w-none">
                          {column.render ? column.render(row[column.key], row) : String(row[column.key] || '')}
                        </div>
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell className="text-right px-3 md:px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 md:h-8 md:w-8 p-0">
                              <RiMoreLine className="w-3 h-3 md:w-4 md:h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {actions
                              .filter(action => !action.condition || action.condition(row))
                              .map((action) => (
                                <DropdownMenuItem
                                  key={action.key}
                                  onClick={() => action.onClick(row)}
                                  className={action.variant === 'destructive' ? 'text-red-600' : ''}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 flex-shrink-0">{action.icon}</span>
                                    <span className="truncate">{action.label}</span>
                                  </div>
                                </DropdownMenuItem>
                              ))
                            }
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-3">
            <div className="text-xs md:text-sm text-gray-500 text-center sm:text-left">
              Показано {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, sortedData.length)} из {sortedData.length} записей
            </div>
            <div className="flex items-center justify-center gap-1 md:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="text-xs md:text-sm px-2 md:px-3"
              >
                Назад
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-7 h-7 md:w-8 md:h-8 p-0 text-xs md:text-sm"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="text-xs md:text-sm px-2 md:px-3"
              >
                Далее
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedTable;