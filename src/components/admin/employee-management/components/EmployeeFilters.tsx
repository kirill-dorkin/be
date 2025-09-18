import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  RefreshCw
} from 'lucide-react';
import { EmployeeFilters as EmployeeFiltersType } from '../types';

interface EmployeeFiltersProps {
  filters: EmployeeFiltersType;
  onFiltersChange: (filters: Partial<EmployeeFiltersType>) => void;
  onCreateClick: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  filters,
  onFiltersChange,
  onCreateClick,
  onRefresh,
  loading
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск по имени или email..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Select 
          value={filters.roleFilter} 
          onValueChange={(value) => onFiltersChange({ roleFilter: value })}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Роль" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все роли</SelectItem>
            <SelectItem value="admin">Администратор</SelectItem>
            <SelectItem value="worker">Сотрудник</SelectItem>
            <SelectItem value="user">Пользователь</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.statusFilter} 
          onValueChange={(value) => onFiltersChange({ statusFilter: value })}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="inactive">Неактивные</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
        
        <Button size="sm" onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить сотрудника
        </Button>
      </div>
    </div>
  );
};