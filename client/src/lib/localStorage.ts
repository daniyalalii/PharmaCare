export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  description?: string;
  manufacturer?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth?: string;
  registrationDate: string;
  insuranceInfo?: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  customerName: string;
  customerId: string;
  doctorName: string;
  medication: string;
  dosage: string;
  quantity: number;
  refills: number;
  status: 'pending' | 'in-progress' | 'ready' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface Settings {
  name: string;
  address: string;
  phone: string;
  email: string;
  licenseNumber: string;
  pharmacistName: string;
  taxRate: number;
  pin: string;
  defaultDiscount: number;
}

// Default data
const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Ibuprofen 200mg',
    sku: 'IBU200',
    category: 'Pain Relief',
    price: 8.99,
    stock: 150,
    lowStockThreshold: 20,
    description: 'Anti-inflammatory pain reliever',
    manufacturer: 'Generic Pharma',
    expiryDate: '2025-12-31',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Acetaminophen 500mg',
    sku: 'ACE500',
    category: 'Pain Relief',
    price: 7.49,
    stock: 8,
    lowStockThreshold: 15,
    description: 'Pain reliever and fever reducer',
    manufacturer: 'MedCorp',
    expiryDate: '2025-10-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Multivitamin Daily',
    sku: 'MVI001',
    category: 'Vitamins',
    price: 15.99,
    stock: 75,
    lowStockThreshold: 10,
    description: 'Complete daily vitamin supplement',
    manufacturer: 'VitaLife',
    expiryDate: '2026-03-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St, City, State 12345',
    dateOfBirth: '1980-05-15',
    registrationDate: new Date().toISOString(),
    insuranceInfo: 'Blue Cross Blue Shield',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 987-6543',
    address: '456 Oak Ave, City, State 12345',
    dateOfBirth: '1992-11-28',
    registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    insuranceInfo: 'Aetna',
  },
];

const defaultPrescriptions: Prescription[] = [
  {
    id: '1',
    prescriptionNumber: 'RX001234',
    customerName: 'John Smith',
    customerId: '1',
    doctorName: 'Dr. Emily Brown',
    medication: 'Lisinopril 10mg',
    dosage: '10mg once daily',
    quantity: 30,
    refills: 5,
    status: 'ready',
    notes: 'Take with food',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    prescriptionNumber: 'RX001235',
    customerName: 'Sarah Johnson',
    customerId: '2',
    doctorName: 'Dr. Michael Davis',
    medication: 'Amoxicillin 500mg',
    dosage: '500mg three times daily',
    quantity: 21,
    refills: 0,
    status: 'pending',
    notes: 'Complete full course',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultTransactions: Transaction[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'John Smith',
    items: [
      {
        productId: '1',
        productName: 'Ibuprofen 200mg',
        quantity: 2,
        price: 8.99,
        total: 17.98,
      },
    ],
    subtotal: 17.98,
    discount: 0,
    tax: 1.44,
    total: 19.42,
    paymentMethod: 'Credit Card',
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
];

const defaultSettings: Settings = {
  name: 'HealthCare Pharmacy',
  address: '789 Medical Center Dr, Health City, HC 54321',
  phone: '(555) PHARMA',
  email: 'info@healthcarepharmacy.com',
  licenseNumber: 'PH123456789',
  pharmacistName: 'Dr. Alex Thompson',
  taxRate: 0.08,
  pin: '0000',
  defaultDiscount: 0,
};

class LocalStorageManager {
  // Products
  getProducts(): Product[] {
    const stored = localStorage.getItem('pharmacy_products');
    if (stored) {
      return JSON.parse(stored);
    }
    this.setProducts(defaultProducts);
    return defaultProducts;
  }

  setProducts(products: Product[]): void {
    localStorage.setItem('pharmacy_products', JSON.stringify(products));
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    this.setProducts(products);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setProducts(products);
    return products[index];
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    if (filteredProducts.length === products.length) return false;
    this.setProducts(filteredProducts);
    return true;
  }

  // Customers
  getCustomers(): Customer[] {
    const stored = localStorage.getItem('pharmacy_customers');
    if (stored) {
      return JSON.parse(stored);
    }
    this.setCustomers(defaultCustomers);
    return defaultCustomers;
  }

  setCustomers(customers: Customer[]): void {
    localStorage.setItem('pharmacy_customers', JSON.stringify(customers));
  }

  addCustomer(customer: Omit<Customer, 'id' | 'registrationDate'>): Customer {
    const customers = this.getCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      registrationDate: new Date().toISOString(),
    };
    customers.push(newCustomer);
    this.setCustomers(customers);
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    customers[index] = { ...customers[index], ...updates };
    this.setCustomers(customers);
    return customers[index];
  }

  deleteCustomer(id: string): boolean {
    const customers = this.getCustomers();
    const filteredCustomers = customers.filter(c => c.id !== id);
    if (filteredCustomers.length === customers.length) return false;
    this.setCustomers(filteredCustomers);
    return true;
  }

  // Prescriptions
  getPrescriptions(): Prescription[] {
    const stored = localStorage.getItem('pharmacy_prescriptions');
    if (stored) {
      return JSON.parse(stored);
    }
    this.setPrescriptions(defaultPrescriptions);
    return defaultPrescriptions;
  }

  setPrescriptions(prescriptions: Prescription[]): void {
    localStorage.setItem('pharmacy_prescriptions', JSON.stringify(prescriptions));
  }

  addPrescription(prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Prescription {
    const prescriptions = this.getPrescriptions();
    const newPrescription: Prescription = {
      ...prescription,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    prescriptions.push(newPrescription);
    this.setPrescriptions(prescriptions);
    return newPrescription;
  }

  updatePrescription(id: string, updates: Partial<Prescription>): Prescription | null {
    const prescriptions = this.getPrescriptions();
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    prescriptions[index] = {
      ...prescriptions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setPrescriptions(prescriptions);
    return prescriptions[index];
  }

  deletePrescription(id: string): boolean {
    const prescriptions = this.getPrescriptions();
    const filteredPrescriptions = prescriptions.filter(p => p.id !== id);
    if (filteredPrescriptions.length === prescriptions.length) return false;
    this.setPrescriptions(filteredPrescriptions);
    return true;
  }

  // Transactions
  getTransactions(): Transaction[] {
    const stored = localStorage.getItem('pharmacy_transactions');
    if (stored) {
      return JSON.parse(stored);
    }
    this.setTransactions(defaultTransactions);
    return defaultTransactions;
  }

  setTransactions(transactions: Transaction[]): void {
    localStorage.setItem('pharmacy_transactions', JSON.stringify(transactions));
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const transactions = this.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    this.setTransactions(transactions);
    return newTransaction;
  }

  // Settings
  getSettings(): Settings {
    const stored = localStorage.getItem('pharmacy_settings');
    if (stored) {
      return JSON.parse(stored);
    }
    this.setSettings(defaultSettings);
    return defaultSettings;
  }

  setSettings(settings: Settings): void {
    localStorage.setItem('pharmacy_settings', JSON.stringify(settings));
  }

  updateSettings(updates: Partial<Settings>): Settings {
    const settings = this.getSettings();
    const newSettings = { ...settings, ...updates };
    this.setSettings(newSettings);
    return newSettings;
  }

  // Utility methods
  exportData() {
    return {
      products: this.getProducts(),
      customers: this.getCustomers(),
      prescriptions: this.getPrescriptions(),
      transactions: this.getTransactions(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString(),
    };
  }

  importData(data: any) {
    if (data.products) this.setProducts(data.products);
    if (data.customers) this.setCustomers(data.customers);
    if (data.prescriptions) this.setPrescriptions(data.prescriptions);
    if (data.transactions) this.setTransactions(data.transactions);
    if (data.settings) this.setSettings(data.settings);
  }

  clearAllData() {
    localStorage.removeItem('pharmacy_products');
    localStorage.removeItem('pharmacy_customers');
    localStorage.removeItem('pharmacy_prescriptions');
    localStorage.removeItem('pharmacy_transactions');
    localStorage.removeItem('pharmacy_settings');
  }
}

export const localStorageManager = new LocalStorageManager();