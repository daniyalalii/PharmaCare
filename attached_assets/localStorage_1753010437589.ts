import { Product, Customer, Transaction, Prescription, Settings } from '@shared/schema';

export class LocalStorageManager {
  private static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return null;
    }
  }

  private static set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
      return false;
    }
  }

  // Products
  static getProducts(): Product[] {
    return this.get<Product[]>('products') || [];
  }

  static setProducts(products: Product[]): boolean {
    return this.set('products', products);
  }

  static addProduct(product: Omit<Product, 'id'>): Product {
    const products = this.getProducts();
    const newProduct = {
      ...product,
      id: Math.max(...products.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    this.setProducts(products);
    return newProduct;
  }

  static updateProduct(id: number, updates: Partial<Product>): boolean {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    products[index] = { 
      ...products[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    return this.setProducts(products);
  }

  static deleteProduct(id: number): boolean {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    return this.setProducts(filteredProducts);
  }

  // Customers
  static getCustomers(): Customer[] {
    return this.get<Customer[]>('customers') || [];
  }

  static setCustomers(customers: Customer[]): boolean {
    return this.set('customers', customers);
  }

  static addCustomer(customer: Omit<Customer, 'id' | 'totalSpent'>): Customer {
    const customers = this.getCustomers();
    const newCustomer = {
      ...customer,
      id: Math.max(...customers.map(c => c.id), 0) + 1,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    this.setCustomers(customers);
    return newCustomer;
  }

  static updateCustomer(id: number, updates: Partial<Customer>): boolean {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    customers[index] = { 
      ...customers[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    return this.setCustomers(customers);
  }

  static deleteCustomer(id: number): boolean {
    const customers = this.getCustomers();
    const filteredCustomers = customers.filter(c => c.id !== id);
    return this.setCustomers(filteredCustomers);
  }

  // Transactions
  static getTransactions(): Transaction[] {
    return this.get<Transaction[]>('transactions') || [];
  }

  static setTransactions(transactions: Transaction[]): boolean {
    return this.set('transactions', transactions);
  }

  static addTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
    const transactions = this.getTransactions();
    const newTransaction = {
      ...transaction,
      id: Math.max(...transactions.map(t => t.id), 0) + 1,
    };
    transactions.push(newTransaction);
    this.setTransactions(transactions);
    return newTransaction;
  }

  // Prescriptions
  static getPrescriptions(): Prescription[] {
    return this.get<Prescription[]>('prescriptions') || [];
  }

  static setPrescriptions(prescriptions: Prescription[]): boolean {
    return this.set('prescriptions', prescriptions);
  }

  static addPrescription(prescription: Omit<Prescription, 'id'>): Prescription {
    const prescriptions = this.getPrescriptions();
    const newPrescription = {
      ...prescription,
      id: Math.max(...prescriptions.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString(),
    };
    prescriptions.push(newPrescription);
    this.setPrescriptions(prescriptions);
    return newPrescription;
  }

  static updatePrescription(id: number, updates: Partial<Prescription>): boolean {
    const prescriptions = this.getPrescriptions();
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    prescriptions[index] = { ...prescriptions[index], ...updates };
    return this.setPrescriptions(prescriptions);
  }

  // Settings
  static getSettings(): Settings {
    return this.get<Settings>('settings') || {
      securityPin: '0000',
      taxRate: 0.085,
      storeName: 'PharmaCare',
      storeAddress: '123 Main Street, City, State 12345',
      storePhone: '(555) 123-4567',
      currency: 'USD',
    };
  }

  static setSettings(settings: Settings): boolean {
    return this.set('settings', settings);
  }

  static updateSetting(key: keyof Settings, value: string | number): boolean {
    const settings = this.getSettings();
    settings[key] = value as any;
    return this.setSettings(settings);
  }

  // Initialize sample data
  static initializeSampleData(): void {
    if (this.getProducts().length === 0) {
      const sampleProducts: Product[] = [
        {
          id: 1,
          name: 'Aspirin 325mg',
          category: 'Medications',
          price: 8.99,
          stock: 150,
          expiry: '2025-12-31',
          manufacturer: 'Generic Pharma',
          batch: 'ASP2024001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Vitamin D3 1000IU',
          category: 'Vitamins',
          price: 12.49,
          stock: 8,
          expiry: '2025-06-30',
          manufacturer: 'Health Plus',
          batch: 'VD3202401',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 3,
          name: 'Band-Aid Variety Pack',
          category: 'First Aid',
          price: 5.99,
          stock: 45,
          expiry: '2026-01-15',
          manufacturer: 'MedSupply Co',
          batch: 'BA202401',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 4,
          name: 'Cough Syrup',
          category: 'Medications',
          price: 15.99,
          stock: 2,
          expiry: '2024-11-30',
          manufacturer: 'CoughCare Inc',
          batch: 'CS202401',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      this.setProducts(sampleProducts);
    }

    if (this.getCustomers().length === 0) {
      const sampleCustomers: Customer[] = [
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '(555) 123-4567',
          address: '123 Main St, City, State 12345',
          dateOfBirth: '1980-05-15',
          registrationDate: '2023-01-15',
          totalSpent: 245.67,
          lastVisit: '2024-01-15T10:30:00Z',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Mary Johnson',
          email: 'mary.johnson@email.com',
          phone: '(555) 234-5678',
          address: '456 Oak Ave, City, State 12345',
          dateOfBirth: '1975-09-22',
          registrationDate: '2023-03-10',
          totalSpent: 189.45,
          lastVisit: '2024-01-10T14:20:00Z',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      this.setCustomers(sampleCustomers);
    }

    if (this.getTransactions().length === 0) {
      const sampleTransactions: Transaction[] = [
        {
          id: 1,
          customerId: 1,
          items: [
            { productId: 1, quantity: 2, price: 8.99 },
            { productId: 3, quantity: 1, price: 5.99 }
          ],
          subtotal: 23.97,
          tax: 2.04,
          total: 26.01,
          paymentMethod: 'Cash',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          customerId: null,
          items: [
            { productId: 2, quantity: 1, price: 12.49 }
          ],
          subtotal: 12.49,
          tax: 1.06,
          total: 13.55,
          paymentMethod: 'Credit Card',
          createdAt: '2024-01-15T14:20:00Z'
        }
      ];
      this.setTransactions(sampleTransactions);
    }

    if (this.getPrescriptions().length === 0) {
      const samplePrescriptions: Prescription[] = [
        {
          id: 1,
          customerId: 1,
          doctorName: 'Dr. Smith',
          medications: [
            { productId: 1, quantity: 30, dosage: '325mg', frequency: 'Once daily' }
          ],
          status: 'pending',
          prescriptionDate: '2024-01-15',
          createdAt: new Date().toISOString(),
        }
      ];
      this.setPrescriptions(samplePrescriptions);
    }
  }

  // Export all data
  static exportAllData() {
    return {
      products: this.getProducts(),
      customers: this.getCustomers(),
      transactions: this.getTransactions(),
      prescriptions: this.getPrescriptions(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString(),
    };
  }

  // Clear all data
  static clearAllData(): boolean {
    try {
      localStorage.removeItem('products');
      localStorage.removeItem('customers');
      localStorage.removeItem('transactions');
      localStorage.removeItem('prescriptions');
      localStorage.removeItem('settings');
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
}
