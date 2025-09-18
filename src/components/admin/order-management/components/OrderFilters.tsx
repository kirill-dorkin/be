import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download } from 'lucide-react';
import { OrderFilters as OrderFiltersType } from '../types';

interface OrderFiltersProps {
  filters: OrderFiltersType;
  onFiltersChange: (filters: OrderFiltersType) => void;
  onExport: () => void;
  isExporting: boolean;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport,
  isExporting
}) => {
  const handleFilterChange = (key: keyof OrderFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Поиск по номеру заказа, имени клиента или email..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select
        value={filters.statusFilter}
        onValueChange={(value) => handleFilterChange('statusFilter', value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Статус заказа" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="pending">В ожидании</SelectItem>
          <SelectItem value="processing">В обработке</SelectItem>
          <SelectItem value="shipped">Отправлено</SelectItem>
          <SelectItem value="delivered">Доставлено</SelectItem>
          <SelectItem value="cancelled">Отменено</SelectItem>
        </SelectContent>
      </Select>
      
      <Select
        value={filters.paymentFilter}
        onValueChange={(value) => handleFilterChange('paymentFilter', value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Статус оплаты" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="pending">Ожидает оплаты</SelectItem>
          <SelectItem value="paid">Оплачено</SelectItem>
          <SelectItem value="failed">Ошибка оплаты</SelectItem>
          <SelectItem value="refunded">Возврат</SelectItem>
        </SelectContent>
      </Select>
      
      <Select
        value={filters.dateFilter}
        onValueChange={(value) => handleFilterChange('dateFilter', value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Период" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все время</SelectItem>
          <SelectItem value="today">Сегодня</SelectItem>
          <SelectItem value="week">Эта неделя</SelectItem>
          <SelectItem value="month">Этот месяц</SelectItem>
          <SelectItem value="quarter">Этот квартал</SelectItem>
          <SelectItem value="year">Этот год</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        onClick={onExport}
        disabled={isExporting}
        variant="outline"
        className="w-full sm:w-auto"
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Экспорт...' : 'Экспорт'}
      </Button>
    </div>
  );
};