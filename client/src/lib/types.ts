export interface Product {
  id: string;
  name: string;
  category: 'prescription' | 'otc' | 'medical-supplies' | 'vitamins';
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  description?: string;
  manufacturer?: string;
  expiryDate?: string;
  batchNumber?: string;
  requiresPrescription?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  isVIP: boolean;
  totalPurchases: number;
  registrationDate: string;
  lastVisit?: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  customerId: string;
  customerName: string;
  doctorName: string;
  medication: string;
  dosage: string;
  quantity: number;
  instructions: string;
  status: 'pending' | 'in-progress' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  filledAt?: string;
  notes?: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Transaction {
  id: string;
  customerId?: string;
  customerName: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'insurance';
  createdAt: string;
  completedAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  stock: number;
}

export interface PharmacySettings {
  name: string;
  pharmacistName: string;
  address: string;
  phone: string;
  email: string;
  licenseNumber: string;
  taxRate: number;
  securityPin: string;
  currency: string;
  timezone: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockItems: number;
  todaysSales: number;
  pendingPrescriptions: number;
}