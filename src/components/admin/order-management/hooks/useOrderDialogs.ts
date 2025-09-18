import { useState } from 'react';
import { Order, UseOrderDialogsReturn } from '../types';

export const useOrderDialogs = (): UseOrderDialogsReturn => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Partial<Order>>({});

  const openViewDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const closeAllDialogs = () => {
    setSelectedOrder(null);
    setIsViewDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setOrderToDelete(null);
    setEditingOrder({});
  };

  return {
    selectedOrder,
    isViewDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    orderToDelete,
    editingOrder,
    openViewDialog,
    openEditDialog,
    openDeleteDialog,
    closeAllDialogs,
    setEditingOrder
  };
};