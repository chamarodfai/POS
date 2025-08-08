// Types for the POS system
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  cost: number; // ต้นทุนของสินค้า
  category: string;
  description?: string;
  image?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promotionId?: string;
  promotion?: Promotion;
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface SalesReport {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  topSellingItems: {
    menuItemId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
