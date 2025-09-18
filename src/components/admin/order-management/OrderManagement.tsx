'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, RotateCcw } from 'lucide-react';
import { OrderManagementProps, OrderFilters } from './types';
import { useOrderData } from './hooks/useOrderData';
import { useOrderActions } from './hooks/useOrderActions';
import { useOrderDialogs } from './hooks/useOrderDialogs';
import { OrderStats } from './components/OrderStats';
import { OrderFilters as OrderFiltersComponent } from './components/OrderFilters';
import { OrderTable } from './components/OrderTable';

export const OrderManagement: React.FC<OrderManagementProps> = ({ className }) => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<OrderFilters>({
    searchTerm: '',
    statusFilter: 'all',
    paymentFilter: 'all',
    dateFilter: 'all'
  });

  const { orders, stats, loading, fetchOrders } = useOrderData();
  const { updateOrder, deleteOrder, bulkAction, exportOrders, isExporting } = useOrderActions({
    onOrderUpdate: fetchOrders
  });
  const {
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
  } = useOrderDialogs();

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = filters.searchTerm === '' || 
        order.orderNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        order.user.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.statusFilter === 'all' || order.orderStatus === filters.statusFilter;
      const matchesPayment = filters.paymentFilter === 'all' || order.paymentStatus === filters.paymentFilter;
      
      let matchesDate = true;
      if (filters.dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        
        switch (filters.dateFilter) {
          case 'today':
            matchesDate = orderDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = orderDate >= weekAgo;
            break;
          case 'month':
            matchesDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
            break;
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            const orderQuarter = Math.floor(orderDate.getMonth() / 3);
            matchesDate = orderQuarter === quarter && orderDate.getFullYear() === now.getFullYear();
            break;
          case 'year':
            matchesDate = orderDate.getFullYear() === now.getFullYear();
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];
      
      if (sortBy === 'user.name') {
        aValue = a.user.name;
        bValue = b.user.name;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [orders, filters, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedOrders(checked ? paginatedOrders.map(order => order._id) : []);
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    await bulkAction('delete', selectedOrders);
    setSelectedOrders([]);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedOrders.length === 0) return;
    await bulkAction('updateStatus', selectedOrders, status);
    setSelectedOrders([]);
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete);
      closeAllDialogs();
    }
  };

  const handleEditSave = async () => {
    if (selectedOrder && editingOrder) {
      await updateOrder(selectedOrder._id, editingOrder);
      closeAllDialogs();
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Управление заказами</h1>
          <p className="text-muted-foreground mt-2">
            Просматривайте и управляйте заказами клиентов
          </p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Обновить
        </Button>
      </div>

      <OrderStats stats={stats} loading={loading} />

      <OrderFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onExport={exportOrders}
        isExporting={isExporting}
      />

      {selectedOrders.length > 0 && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Выбрано: {selectedOrders.length}
              </span>
              <div className="flex items-center gap-2">
                <Select onValueChange={handleBulkStatusUpdate}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Изменить статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">В ожидании</SelectItem>
                    <SelectItem value="processing">В обработке</SelectItem>
                    <SelectItem value="shipped">Отправлено</SelectItem>
                    <SelectItem value="delivered">Доставлено</SelectItem>
                    <SelectItem value="cancelled">Отменено</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить выбранные
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <OrderTable
        orders={paginatedOrders}
        selectedOrders={selectedOrders}
        onOrderSelect={handleOrderSelect}
        onSelectAll={handleSelectAll}
        onViewOrder={openViewDialog}
        onEditOrder={openEditDialog}
        onDeleteOrder={openDeleteDialog}
        loading={loading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Показано {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedOrders.length)} из {filteredAndSortedOrders.length}
            </span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Назад
            </Button>
            <span className="text-sm">
              Страница {currentPage} из {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Далее
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};