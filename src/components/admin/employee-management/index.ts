// Главный компонент
export { EmployeeManagement } from './EmployeeManagement';

// Типы
export type {
  Employee,
  EmployeeFormData,
  EmployeePagination,
  EmployeeManagementProps,
  EmployeeDialogStates,
  EmployeeActions
} from './types';

export type { EmployeeStats } from './types';
export type { EmployeeFilters } from './types';

// Хуки
export { useEmployeeData } from './hooks/useEmployeeData';
export { useEmployeeActions } from './hooks/useEmployeeActions';
export { useEmployeeDialogs } from './hooks/useEmployeeDialogs';

// Компоненты
export { EmployeeStats } from './components/EmployeeStats';
export { EmployeeFilters } from './components/EmployeeFilters';
export { EmployeeTable } from './components/EmployeeTable';
export { EmployeeCreateDialog } from './components/EmployeeCreateDialog';
export { EmployeeEditDialog } from './components/EmployeeEditDialog';
export { EmployeeViewDialog } from './components/EmployeeViewDialog';
export { EmployeeDeleteDialog } from './components/EmployeeDeleteDialog';