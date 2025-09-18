import { useState, useCallback } from 'react';
import { User, UserFormData, UserDialogState } from '../types';

interface UseUserDialogsReturn {
  dialogState: UserDialogState;
  formData: UserFormData;
  setFormData: (data: UserFormData | ((prev: UserFormData) => UserFormData)) => void;
  openCreateDialog: () => void;
  openEditDialog: (user: User) => void;
  openViewDialog: (user: User) => void;
  openDeleteDialog: (user: User) => void;
  closeAllDialogs: () => void;
  resetForm: () => void;
}

const initialDialogState: UserDialogState = {
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  isViewDialogOpen: false,
  editingUser: null,
  viewingUser: null,
  deletingUser: null
};

const initialFormData: UserFormData = {
  name: '',
  email: '',
  role: 'user',
  isActive: true,
  phone: '',
  password: '',
  address: {
    street: '',
    city: '',
    country: '',
    zipCode: ''
  },
  preferences: {
    newsletter: false,
    notifications: true
  }
};

export const useUserDialogs = (): UseUserDialogsReturn => {
  const [dialogState, setDialogState] = useState<UserDialogState>(initialDialogState);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const closeAllDialogs = useCallback(() => {
    setDialogState(initialDialogState);
  }, []);

  const openCreateDialog = useCallback(() => {
    resetForm();
    setDialogState(prev => ({
      ...prev,
      isCreateDialogOpen: true
    }));
  }, [resetForm]);

  const openEditDialog = useCallback((user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      phone: user.phone || '',
      address: user.address || {
        street: '',
        city: '',
        country: '',
        zipCode: ''
      },
      preferences: user.preferences || {
        newsletter: false,
        notifications: true
      }
    });
    setDialogState(prev => ({
      ...prev,
      isEditDialogOpen: true,
      editingUser: user
    }));
  }, []);

  const openViewDialog = useCallback((user: User) => {
    setDialogState(prev => ({
      ...prev,
      isViewDialogOpen: true,
      viewingUser: user
    }));
  }, []);

  const openDeleteDialog = useCallback((user: User) => {
    setDialogState(prev => ({
      ...prev,
      isDeleteDialogOpen: true,
      deletingUser: user
    }));
  }, []);

  return {
    dialogState,
    formData,
    setFormData,
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    closeAllDialogs,
    resetForm
  };
};