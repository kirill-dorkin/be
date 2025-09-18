import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Order } from '../types';

// Utility function for currency formatting
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount);
};

// Utility function for date formatting
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface OrderTableProps {
  orders: Order[];
  selectedOrders: string[];
  onOrderSelect: (orderId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  loading: boolean;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  selectedOrders,
  onOrderSelect,
  onSelectAll,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  loading
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'В ожидании', variant: 'secondary' as const },
      processing: { label: 'В обработке', variant: 'default' as const },
      shipped: { label: 'Отправлено', variant: 'default' as const },
      delivered: { label: 'Доставлено', variant: 'default' as const },
      cancelled: { label: 'Отменено', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, variant: 'default' as const };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Ожидает', variant: 'secondary' as const },
      paid: { label: 'Оплачено', variant: 'default' as const },
      failed: { label: 'Ошибка', variant: 'destructive' as const },
      refunded: { label: 'Возврат', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, variant: 'default' as const };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Номер заказа</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Оплата</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead className="w-32">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-6 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-6 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-8 bg-gray-200 rounded animate-pulse"></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={orders.length > 0 && selectedOrders.length === orders.length}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Номер заказа</TableHead>
            <TableHead>Клиент</TableHead>
            <TableHead>Сумма</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Оплата</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead className="w-32">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Заказы не найдены
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.includes(order._id)}
                    onCheckedChange={() => onOrderSelect(order._id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.user.name}</div>
                    <div className="text-sm text-muted-foreground">{order.user.email}</div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(order.totalAmount)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(order.orderStatus)}
                </TableCell>
                <TableCell>
                  {getPaymentStatusBadge(order.paymentStatus)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditOrder(order)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteOrder(order._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};