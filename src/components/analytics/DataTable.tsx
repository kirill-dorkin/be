'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Базовый тип для строки таблицы
export type TableRowData = Record<string, unknown>;

// Дженерик интерфейс для колонки таблицы
export interface TableColumn<T extends TableRowData = TableRowData> {
  key: Extract<keyof T, string | number>;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[Extract<keyof T, string | number>], row: T) => React.ReactNode;
}

// Дженерик интерфейс для пропсов таблицы
interface DataTableProps<T extends TableRowData = TableRowData> {
  columns: TableColumn<T>[];
  data: T[];
  title?: string;
  searchable?: boolean;
  exportable?: boolean;
  pageSize?: number;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export const DataTable = <T extends TableRowData = TableRowData>({
  columns,
  data,
  title,
  searchable = true,
  exportable = true,
  pageSize = 10,
  className = ''
}: DataTableProps<T>) => {

  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  // Фильтрация данных по поисковому запросу
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Сортировка данных
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;

      // Type guards для безопасного сравнения
      const aComparable = typeof aValue === 'string' || typeof aValue === 'number' ? aValue : String(aValue);
      const bComparable = typeof bValue === 'string' || typeof bValue === 'number' ? bValue : String(bValue);
      
      const comparison = aComparable < bComparable ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Пагинация
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleExport = () => {
    const csvContent = [
      columns.map(col => col.label).join(','),
      ...sortedData.map(row =>
        columns.map(col => {
          const value = row[col.key];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : String(value);
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title || 'data'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Заголовок и действия */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="min-w-0 flex-1">
              {title && (
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {title}
                </h3>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Всего записей: {filteredData.length}
              </p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              {exportable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center gap-2 flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Экспорт</span>
                  <span className="sm:hidden">CSV</span>
                </Button>
              )}
            </div>
          </div>
          
          {searchable && (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full min-h-[44px] sm:min-h-0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Мобильная версия - карточки */}
      <div className="block sm:hidden p-4 space-y-4">
        {paginatedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Нет данных для отображения
          </div>
        ) : (
          paginatedData.map((row, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
              {columns.map((column) => (
                <div key={String(column.key)} className="flex justify-between items-start gap-2">
                  <span className="text-sm font-medium text-gray-600 min-w-0 flex-shrink-0">
                    {column.label}:
                  </span>
                  <span className="text-sm text-gray-900 text-right min-w-0 break-words">
                    {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? '')}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Десктопная версия - таблица */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
              column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
            } ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && getSortIcon(String(column.key))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  Нет данных для отображения
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                    >
                      {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="p-4 sm:px-6 sm:py-4 border-t border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="text-sm text-gray-700 text-center sm:text-left">
              {startIndex + 1}-{Math.min(endIndex, sortedData.length)} из {sortedData.length} записей
            </div>
            
            {/* Мобильная пагинация */}
            <div className="flex sm:hidden items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="min-h-[44px]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-16 min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm px-4 py-2 bg-gray-100 rounded">
                  {currentPage} / {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="min-h-[44px]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Десктопная пагинация */}
            <div className="hidden sm:flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Показать:
                </span>
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-700">
                  записей
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="px-3 py-1 text-sm">
                  {currentPage} из {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};