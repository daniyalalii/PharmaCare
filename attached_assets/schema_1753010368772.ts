import { z } from "zod";

// Product schema
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  expiry: z.string(), // ISO date string
  manufacturer: z.string(),
  batch: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const insertProductSchema = productSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Customer schema
export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  dateOfBirth: z.string(), // ISO date string
  registrationDate: z.string(), // ISO date string
  totalSpent: z.number().min(0).default(0),
  lastVisit: z.string().optional(), // ISO date string
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const insertCustomerSchema = customerSchema.omit({ id: true, createdAt: true, updatedAt: true, totalSpent: true });
export type Customer = z.infer<typeof customerSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

// Transaction schema
export const transactionItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
});

export const transactionSchema = z.object({
  id: z.number(),
  customerId: z.number().nullable(),
  items: z.array(transactionItemSchema),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  paymentMethod: z.string(),
  createdAt: z.string(),
});

export const insertTransactionSchema = transactionSchema.omit({ id: true });
export type Transaction = z.infer<typeof transactionSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type TransactionItem = z.infer<typeof transactionItemSchema>;

// Prescription schema
export const prescriptionSchema = z.object({
  id: z.number(),
  customerId: z.number(),
  doctorName: z.string(),
  medications: z.array(z.object({
    productId: z.number(),
    quantity: z.number().int().min(1),
    dosage: z.string(),
    frequency: z.string(),
  })),
  status: z.enum(['pending', 'ready', 'dispensed']),
  prescriptionDate: z.string(), // ISO date string
  createdAt: z.string().optional(),
});

export const insertPrescriptionSchema = prescriptionSchema.omit({ id: true, createdAt: true });
export type Prescription = z.infer<typeof prescriptionSchema>;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

// Settings schema
export const settingsSchema = z.object({
  securityPin: z.string(),
  taxRate: z.number().min(0).max(1),
  storeName: z.string(),
  storeAddress: z.string(),
  storePhone: z.string(),
  currency: z.string().default('USD'),
});

export type Settings = z.infer<typeof settingsSchema>;
