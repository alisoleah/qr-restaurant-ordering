export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  tip?: number;
  tipType?: 'percentage' | 'custom' | null;
  tipPercentage?: number | null;
  total: number;
  customerEmail?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
  paymentMethod?: 'card' | 'apple_pay';
  paymentStatus?: 'pending' | 'completed' | 'failed';
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  serviceChargeRate: number;
}