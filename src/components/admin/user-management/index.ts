// Main component
export { UserManagement } from './components/UserManagement';

// Individual components
export { UserStats } from './components/UserStats';
export { UserTable } from './components/UserTable';
export { UserCreateDialog } from './components/UserCreateDialog';
export { UserEditDialog } from './components/UserEditDialog';
export { UserViewDialog } from './components/UserViewDialog';
export { UserDeleteDialog } from './components/UserDeleteDialog';

// Hooks
export { useUserData } from './hooks/useUserData';
export { useUserActions } from './hooks/useUserActions';
export { useUserDialogs } from './hooks/useUserDialogs';

// Types
export type {
  User,
  UserFormData,
  UserStats as IUserStats,
  BulkActionData,
  UserManagementProps,
  UserDialogState,
  UserFilters,
  UserPagination,
  UserRole,
  UserStatus,
  VerificationStatus
} from './types';