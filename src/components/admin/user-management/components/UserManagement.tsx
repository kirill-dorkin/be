import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Users,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react';

// Import our custom hooks and components
import { useUserData } from '../hooks/useUserData';
import { useUserActions } from '../hooks/useUserActions';
import { useUserDialogs } from '../hooks/useUserDialogs';
import { UserStats } from './UserStats';
import { UserTable } from './UserTable';
import { UserCreateDialog } from './UserCreateDialog';
import { UserEditDialog } from './UserEditDialog';
import { UserViewDialog } from './UserViewDialog';
import { UserDeleteDialog } from './UserDeleteDialog';
import { UserManagementProps } from '../types';

export const UserManagement = ({ initialUsers = [] }: UserManagementProps) => {
  // Custom hooks
  const {
    users,
    stats,
    loading,
    filters,
    pagination,
    selectedUsers,
    setFilters,
    setSelectedUsers,
    fetchUsers,
    refreshUsers
  } = useUserData(initialUsers);

  const {
    createUser,
    updateUser,
    deleteUser,
    bulkAction,
    exportUsers
  } = useUserActions({ refreshUsers });

  const {
    dialogState,
    formData,
    setFormData,
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    closeAllDialogs,
    resetForm
  } = useUserDialogs();

  // Event handlers
  const handleCreateUser = async () => {
    try {
      await createUser(formData);
      closeAllDialogs();
      resetForm();
      toast.success('Пользователь успешно создан');
    } catch (error) {
      toast.error('Ошибка при создании пользователя');
    }
  };

  const handleUpdateUser = async () => {
    if (!dialogState.editingUser) return;
    
    try {
      await updateUser(dialogState.editingUser._id, formData);
      closeAllDialogs();
      resetForm();
      toast.success('Пользователь успешно обновлен');
    } catch (error) {
      toast.error('Ошибка при обновлении пользователя');
    }
  };

  const handleDeleteUser = async () => {
    if (!dialogState.deletingUser) return;
    
    try {
      await deleteUser(dialogState.deletingUser._id);
      closeAllDialogs();
      toast.success('Пользователь успешно удален');
    } catch (error) {
      toast.error('Ошибка при удалении пользователя');
    }
  };

  const handleBulkAction = async (action: string, data: any) => {
    if (selectedUsers.length === 0) {
      toast.error('Выберите пользователей для выполнения действия');
      return;
    }

    try {
      await bulkAction(action, selectedUsers, data);
      setSelectedUsers([]);
      toast.success(`Действие выполнено для ${selectedUsers.length} пользователей`);
    } catch (error) {
      toast.error('Ошибка при выполнении группового действия');
    }
  };

  const handleExport = async () => {
    try {
      await exportUsers(filters);
      toast.success('Экспорт завершен');
    } catch (error) {
      toast.error('Ошибка при экспорте');
    }
  };

  const handleRefresh = async () => {
    await refreshUsers();
    toast.success('Данные обновлены');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление пользователями</h1>
          <p className="text-muted-foreground">
            Управляйте пользователями, их ролями и правами доступа
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Создать пользователя
          </Button>
        </div>
      </div>

      {/* Stats */}
      <UserStats stats={stats} />

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры и действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по имени или email..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select
                value={filters.roleFilter}
                onValueChange={(value) => setFilters({ ...filters, roleFilter: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="worker">Сотрудник</SelectItem>
                  <SelectItem value="moderator">Модератор</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.statusFilter}
                onValueChange={(value) => setFilters({ ...filters, statusFilter: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                  <SelectItem value="suspended">Заблокированные</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.verificationFilter}
                onValueChange={(value) => setFilters({ ...filters, verificationFilter: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Верификация" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="verified">Подтвержденные</SelectItem>
                  <SelectItem value="unverified">Неподтвержденные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Badge variant="secondary">
                  {selectedUsers.length} выбрано
                </Badge>
                <div className="flex gap-2 ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('activate', { isActive: true })}
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Активировать
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('deactivate', { isActive: false })}
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Деактивировать
                  </Button>
                  <Select onValueChange={(role) => handleBulkAction('changeRole', { role })}>
                    <SelectTrigger className="w-[140px] h-8">
                      <Shield className="h-4 w-4 mr-1" />
                      <SelectValue placeholder="Роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Пользователь</SelectItem>
                      <SelectItem value="worker">Сотрудник</SelectItem>
                      <SelectItem value="moderator">Модератор</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Export */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <UserTable
        users={users}
        loading={loading}
        selectedUsers={selectedUsers}
        pagination={pagination}
        onUserSelect={(userId, selected) => {
          if (selected) {
            setSelectedUsers([...selectedUsers, userId]);
          } else {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
          }
        }}
        onSelectAll={(selected) => {
          if (selected) {
            setSelectedUsers(users.map(user => user._id));
          } else {
            setSelectedUsers([]);
          }
        }}
        onViewUser={openViewDialog}
        onEditUser={openEditDialog}
        onDeleteUser={openDeleteDialog}
        onToggleUserStatus={(user) => {
          // Toggle user status logic
          updateUser(user._id, { ...user, isActive: !user.isActive });
        }}
        onPageChange={(page) => {
          // Handle page change logic
          console.log('Page changed to:', page);
        }}
      />

      {/* Dialogs */}
      <UserCreateDialog
        open={dialogState.isCreateDialogOpen}
        onOpenChange={(open) => !open && closeAllDialogs()}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleCreateUser}
        onCancel={closeAllDialogs}
      />

      <UserEditDialog
        open={dialogState.isEditDialogOpen}
        onOpenChange={(open) => !open && closeAllDialogs()}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleUpdateUser}
        onCancel={closeAllDialogs}
      />

      <UserViewDialog
        open={dialogState.isViewDialogOpen}
        onOpenChange={(open) => !open && closeAllDialogs()}
        user={dialogState.viewingUser}
        onEdit={() => {
          if (dialogState.viewingUser) {
            openEditDialog(dialogState.viewingUser);
          }
        }}
        onClose={closeAllDialogs}
      />

      <UserDeleteDialog
        open={dialogState.isDeleteDialogOpen}
        onOpenChange={(open) => !open && closeAllDialogs()}
        user={dialogState.deletingUser}
        onConfirm={handleDeleteUser}
        onCancel={closeAllDialogs}
      />
    </div>
  );
};