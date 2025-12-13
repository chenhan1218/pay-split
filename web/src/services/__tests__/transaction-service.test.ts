import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from '../transaction-service';
import { TransactionSchema } from '../../features/transactions/schemas';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  getDocs,
  orderBy,
} from 'firebase/firestore';

// Mock Firebase Firestore functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(() => ({})), // Marked queryConstraints as unused
  getDocs: vi.fn(),
  orderBy: vi.fn(),
}));

// Mock the firebase.ts module
vi.mock('../../lib/firebase', () => ({
  db: {},
}));

const mockEventId = 'event123';
const mockTransactionId = 'txn123';
const mockUserId = 'user123';

const mockExpenseTransaction = {
  id: mockTransactionId,
  eventId: mockEventId,
  title: 'Dinner',
  amount: 1000,
  date: 1678886400000,
  type: 'EXPENSE' as const,
  category: 'Food',
  paidBy: { user1: 1000 },
  splitDetails: { user1: 500, user2: 500 },
  createdBy: mockUserId,
  createdAt: 1678886400000,
  updatedAt: 1678886400000,
};

const mockTransferTransaction = {
  id: 'txn456',
  eventId: mockEventId,
  title: 'Payment',
  amount: 500,
  date: 1678886400000,
  type: 'TRANSFER' as const,
  fromId: 'user2',
  toId: 'user1',
  note: 'Paying back dinner',
  createdBy: mockUserId,
  createdAt: 1678886400000,
  updatedAt: 1678886400000,
};

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
    vi.clearAllMocks();
  });

  // Test getTransactionById
  describe('getTransactionById', () => {
    it('should return a transaction if found', async () => {
      (getDoc as vi.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ ...mockExpenseTransaction, id: undefined }),
        id: mockExpenseTransaction.id,
      });
      (doc as vi.Mock).mockReturnValue({});

      const result = await service.getTransactionById(mockEventId, mockTransactionId);
      expect(result).toEqual(mockExpenseTransaction);
      expect(doc).toHaveBeenCalledWith(
        {},
        'events',
        mockEventId,
        'transactions',
        mockTransactionId
      );
      TransactionSchema.parse(result);
    });

    it('should return null if transaction not found', async () => {
      (getDoc as vi.Mock).mockResolvedValueOnce({
        exists: () => false,
        data: () => undefined,
      });
      (doc as vi.Mock).mockReturnValue({});

      const result = await service.getTransactionById(mockEventId, 'nonexistent');
      expect(result).toBeNull();
    });
  });

  // Test createExpenseTransaction
  describe('createExpenseTransaction', () => {
    const newExpenseData = {
      title: 'Lunch',
      amount: 500,
      date: 1678886400000,
      type: 'EXPENSE' as const,
      paidBy: { user1: 500 },
      splitDetails: { user1: 250, user2: 250 },
    };

    it('should create a new expense transaction', async () => {
      const mockDocRef = { id: 'new-txn-id' };
      (addDoc as vi.Mock).mockResolvedValueOnce(mockDocRef);
      (collection as vi.Mock).mockReturnValue({});

      const result = await service.createExpenseTransaction(
        mockEventId,
        newExpenseData,
        mockUserId
      );

      expect(addDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          ...newExpenseData,
          eventId: mockEventId,
          createdBy: mockUserId,
          type: 'EXPENSE',
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        })
      );

      expect(result).toEqual(
        expect.objectContaining({
          ...newExpenseData,
          id: mockDocRef.id,
          eventId: mockEventId,
          createdBy: mockUserId,
        })
      );
      TransactionSchema.parse(result);
    });
  });

  // Test createTransferTransaction
  describe('createTransferTransaction', () => {
    const newTransferData = {
      title: 'Transfer',
      amount: 250,
      date: 1678886400000,
      type: 'TRANSFER' as const,
      fromId: 'user2',
      toId: 'user1',
    };

    it('should create a new transfer transaction', async () => {
      const mockDocRef = { id: 'new-transfer-id' };
      (addDoc as vi.Mock).mockResolvedValueOnce(mockDocRef);
      (collection as vi.Mock).mockReturnValue({});

      const result = await service.createTransferTransaction(
        mockEventId,
        newTransferData,
        mockUserId
      );

      expect(addDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          ...newTransferData,
          eventId: mockEventId,
          createdBy: mockUserId,
          type: 'TRANSFER',
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        })
      );

      expect(result).toEqual(
        expect.objectContaining({
          ...newTransferData,
          id: mockDocRef.id,
          eventId: mockEventId,
          createdBy: mockUserId,
        })
      );
      TransactionSchema.parse(result);
    });
  });

  // Test updateTransaction
  describe('updateTransaction', () => {
    it('should update an existing transaction', async () => {
      (updateDoc as vi.Mock).mockResolvedValueOnce(undefined);
      (doc as vi.Mock).mockReturnValue({});

      const updateData = { title: 'Updated Title' };
      await service.updateTransaction(mockEventId, mockTransactionId, updateData);

      expect(updateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          title: 'Updated Title',
          updatedAt: expect.any(Number),
        })
      );
    });
  });

  // Test deleteTransaction
  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      (deleteDoc as vi.Mock).mockResolvedValueOnce(undefined);
      (doc as vi.Mock).mockReturnValue({});

      await service.deleteTransaction(mockEventId, mockTransactionId);

      expect(deleteDoc).toHaveBeenCalledWith({});
      expect(doc).toHaveBeenCalledWith(
        {},
        'events',
        mockEventId,
        'transactions',
        mockTransactionId
      );
    });
  });

  // Test getTransactionsByEventId
  describe('getTransactionsByEventId', () => {
    it('should return all transactions for an event', async () => {
      (getDocs as vi.Mock).mockResolvedValueOnce({
        forEach: (callback: (docSnap: { data: () => unknown; id: string }) => void) => {
          // Explicitly typed callback
          callback({
            data: () => ({ ...mockExpenseTransaction, id: undefined }),
            id: mockExpenseTransaction.id,
          });
          callback({
            data: () => ({ ...mockTransferTransaction, id: undefined }),
            id: mockTransferTransaction.id,
          });
        },
      });
      (collection as vi.Mock).mockReturnValue({});

      const result = await service.getTransactionsByEventId(mockEventId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockExpenseTransaction);
      expect(result[1]).toEqual(mockTransferTransaction);
      expect(getDocs).toHaveBeenCalled();
      expect(query).toHaveBeenCalled();
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });
  });
});
