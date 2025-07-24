import { z } from "zod";

// Product schemas
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['prescription', 'otc', 'medical-supplies', 'vitamins']),
  sku: z.string(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
  requiresPrescription: z.boolean().default(false),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type Product = z.infer<typeof productSchema>;

// Customer schemas
export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  insuranceInfo: z.object({
    provider: z.string(),
    policyNumber: z.string(),
  }).optional(),
  registrationDate: z.string().default(() => new Date().toISOString()),
  lastVisit: z.string().optional(),
  totalPurchases: z.number().default(0),
  isVIP: z.boolean().default(false),
});

export type Customer = z.infer<typeof customerSchema>;

// Prescription schemas
export const prescriptionSchema = z.object({
  id: z.string(),
  prescriptionNumber: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  doctorName: z.string(),
  medication: z.string(),
  dosage: z.string(),
  quantity: z.number().int().positive(),
  instructions: z.string(),
  dateIssued: z.string(),
  dateExpires: z.string(),
  status: z.enum(['pending', 'in-progress', 'ready', 'completed', 'cancelled']),
  refillsRemaining: z.number().int().min(0).default(0),
  createdAt: z.string().default(() => new Date().toISOString()),
  filledAt: z.string().optional(),
});

export type Prescription = z.infer<typeof prescriptionSchema>;

// Transaction schemas
export const transactionItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  total: z.number().positive(),
});

export const transactionSchema = z.object({
  id: z.string(),
  customerId: z.string().optional(),
  customerName: z.string(),
  items: z.array(transactionItemSchema),
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  discount: z.number().min(0),
  total: z.number().positive(),
  paymentMethod: z.enum(['cash', 'card', 'insurance']),
  prescriptionId: z.string().optional(),
  createdAt: z.string().default(() => new Date().toISOString()),
  completedAt: z.string().optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;

// Pharmacy settings schema
export const pharmacySettingsSchema = z.object({
  name: z.string(),
  licenseNumber: z.string(),
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
  businessHours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }),
    tuesday: z.object({ open: z.string(), close: z.string() }),
    wednesday: z.object({ open: z.string(), close: z.string() }),
    thursday: z.object({ open: z.string(), close: z.string() }),
    friday: z.object({ open: z.string(), close: z.string() }),
    saturday: z.object({ open: z.string(), close: z.string() }),
    sunday: z.object({ open: z.string(), close: z.string() }),
  }),
  taxRate: z.number().min(0).max(1),
  lowStockAlerts: z.boolean().default(true),
  autoBackup: z.boolean().default(true),
  prescriptionReminders: z.boolean().default(false),
  securityPin: z.string().length(4),
});

export type PharmacySettings = z.infer<typeof pharmacySettingsSchema>;
export type TransactionItem = z.infer<typeof transactionItemSchema>;

// Settings schemas
export const pharmacySettingsSchema = z.object({
  name: z.string(),
  licenseNumber: z.string(),
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
  businessHours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }),
    tuesday: z.object({ open: z.string(), close: z.string() }),
    wednesday: z.object({ open: z.string(), close: z.string() }),
    thursday: z.object({ open: z.string(), close: z.string() }),
    friday: z.object({ open: z.string(), close: z.string() }),
    saturday: z.object({ open: z.string(), close: z.string() }),
    sunday: z.object({ open: z.string(), close: z.string() }),
  }),
  taxRate: z.number().min(0).max(1),
  lowStockAlerts: z.boolean().default(true),
  autoBackup: z.boolean().default(true),
  prescriptionReminders: z.boolean().default(false),
});

export type PharmacySettings = z.infer<typeof pharmacySettingsSchema>;
