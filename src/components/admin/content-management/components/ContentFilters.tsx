import { Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContentFilters as ContentFiltersType, TEMPLATES, STATUS_OPTIONS } from '../types';

interface ContentFiltersProps {
  filters: ContentFiltersType;
  onFiltersChange: (filters: Partial<ContentFiltersType>) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function ContentFilters({ 
  filters, 
  onFiltersChange, 
  onRefresh, 
  loading = false 
}: ContentFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Поиск по названию, slug или содержимому..."
          value={filters.searchTerm}
          onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
          className="pl-10"
        />
      </div>
      
      <Select
        value={filters.statusFilter}
        onValueChange={(value) => onFiltersChange({ statusFilter: value })}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={filters.templateFilter}
        onValueChange={(value) => onFiltersChange({ templateFilter: value })}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Шаблон" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все шаблоны</SelectItem>
          {TEMPLATES.map((template) => (
            <SelectItem key={template.value} value={template.value}>
              {template.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        onClick={onRefresh}
        variant="outline"
        size="icon"
        disabled={loading}
        className="shrink-0"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}