export interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface OrderFilters {
  searchTerm: string;
  statusFilter: string;
  paymentFilter: string;
  dateFilter: string;
}

export interface OrderManagementProps {
  className?: string;
}

export interface UseOrderDataReturn {
  orders: Order[];
  stats: OrderStats;
  loading: boolean;
  fetchOrders: () => Promise<void>;
}

export interface UseOrderActionsProps {
  onOrderUpdate: () => Promise<void>;
}

export interface UseOrderActionsReturn {
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  bulkAction: (action: 'delete' | 'updateStatus', orderIds: string[], value?: string) => Promise<void>;
  exportOrders: () => Promise<void>;
  isExporting: boolean;
}

export interface UseOrderDialogsReturn {
  selectedOrder: Order | null;
  isViewDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  orderToDelete: string | null;
  editingOrder: Partial<Order>;
  openViewDialog: (order: Order) => void;
  openEditDialog: (order: Order) => void;
  openDeleteDialog: (orderId: string) => void;
  closeAllDialogs: () => void;
  setEditingOrder: (order: Partial<Order>) => void;
}