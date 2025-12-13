import { z } from 'zod';

// Define TransactionType enum for Zod
export const TransactionTypeSchema = z.enum(['EXPENSE', 'TRANSFER']);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

// Base Transaction Schema (common fields for both EXPENSE and TRANSFER)
const BaseTransactionSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string().min(1, 'Transaction title cannot be empty'),
  amount: z.number().positive('Amount must be positive'),
  date: z.number(), // Unix timestamp in milliseconds
  type: TransactionTypeSchema,
  note: z.string().optional().nullable(),
  createdBy: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Expense Transaction Schema
export const ExpenseTransactionSchema = BaseTransactionSchema.extend({
  type: z.literal('EXPENSE'),
  category: z.string().optional().nullable(),
  paidBy: z.record(z.string(), z.number().positive('Paid amount must be positive')), // Key: Participant ID, Value: Amount
  splitDetails: z.record(z.string(), z.number().nonnegative('Split amount cannot be negative')), // Key: Participant ID, Value: Amount
});

export type ExpenseTransaction = z.infer<typeof ExpenseTransactionSchema>;

// Transfer Transaction Schema
export const TransferTransactionSchema = BaseTransactionSchema.extend({
  type: z.literal('TRANSFER'),
  fromId: z.string(), // Participant ID of the payer
  toId: z.string(), // Participant ID of the receiver
});

export type TransferTransaction = z.infer<typeof TransferTransactionSchema>;

// Union type for Transaction
export const TransactionSchema = z.union([ExpenseTransactionSchema, TransferTransactionSchema]);
export type Transaction = z.infer<typeof TransactionSchema>;

// Optional: Schema for creating a new Expense Transaction
export const CreateExpenseTransactionSchema = ExpenseTransactionSchema.omit({
  id: true,
  type: true,
  eventId: true, // Will be set by service
  createdBy: true, // Will be set by auth
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.literal('EXPENSE'),
});
export type CreateExpenseTransaction = z.infer<typeof CreateExpenseTransactionSchema>;

// Optional: Schema for creating a new Transfer Transaction
export const CreateTransferTransactionSchema = TransferTransactionSchema.omit({
  id: true,
  type: true,
  eventId: true, // Will be set by service
  createdBy: true, // Will be set by auth
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.literal('TRANSFER'),
});
export type CreateTransferTransaction = z.infer<typeof CreateTransferTransactionSchema>;
