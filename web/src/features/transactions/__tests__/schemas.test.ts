import { describe, expect, it } from 'vitest';
import { CreateExpenseTransactionSchema, ExpenseTransactionSchema } from '../schemas';

describe('ExpenseTransactionSchema', () => {
  const validExpense = {
    id: 'tx-123',
    eventId: 'evt-1',
    title: 'Lunch',
    amount: 100,
    date: Date.now(),
    type: 'EXPENSE',
    paidBy: { p1: 100 },
    splitDetails: { p1: 50, p2: 50 },
    createdBy: 'user-1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it('validates a correct expense transaction', () => {
    const result = ExpenseTransactionSchema.safeParse(validExpense);
    expect(result.success).toBe(true);
  });

  it('fails if amount is negative', () => {
    const invalid = { ...validExpense, amount: -50 };
    const result = ExpenseTransactionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails if type is not EXPENSE', () => {
    const invalid = { ...validExpense, type: 'TRANSFER' };
    const result = ExpenseTransactionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('CreateExpenseTransactionSchema', () => {
  const validCreateExpense = {
    title: 'Taxi',
    amount: 500,
    date: Date.now(),
    type: 'EXPENSE',
    paidBy: { p1: 500 },
    splitDetails: { p1: 250, p2: 250 },
    note: 'Late night taxi',
  };

  it('validates a correct create expense payload', () => {
    const result = CreateExpenseTransactionSchema.safeParse(validCreateExpense);
    expect(result.success).toBe(true);
  });
});
