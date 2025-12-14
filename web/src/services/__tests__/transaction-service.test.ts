import { FirebaseError } from 'firebase/app';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { TransactionSchema } from '../../features/transactions/schemas';
import { TransactionService } from '../transaction-service';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test getTransactionById
  describe('getTransactionById', () => {
    it('should return a transaction if found', async () => {
      (getDoc as Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ ...mockExpenseTransaction, id: undefined }),
        id: mockExpenseTransaction.id,
      });
      (doc as Mock).mockReturnValue({});

      const result = await TransactionService.getTransactionById(mockEventId, mockTransactionId);
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
      (getDoc as Mock).mockResolvedValueOnce({
        exists: () => false,
        data: () => undefined,
      });
      (doc as Mock).mockReturnValue({});

      const result = await TransactionService.getTransactionById(mockEventId, 'nonexistent');
      expect(result).toBeNull();
    });

    it('should throw an error if Firebase call fails', async () => {
      (getDoc as Mock).mockRejectedValueOnce(
        new FirebaseError('permission-denied', 'Permission denied')
      );
      (doc as Mock).mockReturnValue({});

      await expect(
        TransactionService.getTransactionById(mockEventId, mockTransactionId)
      ).rejects.toThrow('Firebase Error: Permission denied');
    });

    it('should throw a generic error if other error occurs', async () => {
      (getDoc as Mock).mockRejectedValueOnce(new Error('Generic error'));
      (doc as Mock).mockReturnValue({});

      await expect(
        TransactionService.getTransactionById(mockEventId, mockTransactionId)
      ).rejects.toThrow('Failed to get transaction: Generic error');
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
      (addDoc as Mock).mockResolvedValueOnce(mockDocRef);
      (collection as Mock).mockReturnValue({});

      const result = await TransactionService.createExpenseTransaction(
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

    it('should throw an error if Firebase call fails', async () => {
      (addDoc as Mock).mockRejectedValueOnce(
        new FirebaseError('permission-denied', 'Permission denied')
      );
      (collection as Mock).mockReturnValue({});

      await expect(
        TransactionService.createExpenseTransaction(mockEventId, newExpenseData, mockUserId)
      ).rejects.toThrow('Firebase Error: Permission denied');
    });

    it('should throw a generic error if other error occurs', async () => {
      (addDoc as Mock).mockRejectedValueOnce(new Error('Generic error'));
      (collection as Mock).mockReturnValue({});

      await expect(
        TransactionService.createExpenseTransaction(mockEventId, newExpenseData, mockUserId)
      ).rejects.toThrow('Failed to create expense transaction: Generic error');
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
      (addDoc as Mock).mockResolvedValueOnce(mockDocRef);
      (collection as Mock).mockReturnValue({});

      const result = await TransactionService.createTransferTransaction(
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

    it('should throw an error if Firebase call fails', async () => {
      (addDoc as Mock).mockRejectedValueOnce(
        new FirebaseError('permission-denied', 'Permission denied')
      );
      (collection as Mock).mockReturnValue({});

      await expect(
        TransactionService.createTransferTransaction(mockEventId, newTransferData, mockUserId)
      ).rejects.toThrow('Firebase Error: Permission denied');
    });

    it('should throw a generic error if other error occurs', async () => {
      (addDoc as Mock).mockRejectedValueOnce(new Error('Generic error'));
      (collection as Mock).mockReturnValue({});

      await expect(
        TransactionService.createTransferTransaction(mockEventId, newTransferData, mockUserId)
      ).rejects.toThrow('Failed to create transfer transaction: Generic error');
    });
  });

  // Test updateTransaction
  describe('updateTransaction', () => {
    it('should update an existing transaction', async () => {
      (updateDoc as Mock).mockResolvedValueOnce(undefined);
      (doc as Mock).mockReturnValue({});

      const updateData = { title: 'Updated Title' };
      await TransactionService.updateTransaction(mockEventId, mockTransactionId, updateData);

      expect(updateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          title: 'Updated Title',
          updatedAt: expect.any(Number),
        })
      );
    });

    it('should throw an error if Firebase call fails', async () => {
      (updateDoc as Mock).mockRejectedValueOnce(
        new FirebaseError('permission-denied', 'Permission denied')
      );
      (doc as Mock).mockReturnValue({});

      await expect(
        TransactionService.updateTransaction(mockEventId, mockTransactionId, {})
      ).rejects.toThrow('Firebase Error: Permission denied');
    });

    it('should throw a generic error if other error occurs', async () => {
      (updateDoc as Mock).mockRejectedValueOnce(new Error('Generic error'));
      (doc as Mock).mockReturnValue({});

      await expect(
        TransactionService.updateTransaction(mockEventId, mockTransactionId, {})
      ).rejects.toThrow('Failed to update transaction: Generic error');
    });
  });

  // Test deleteTransaction
  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      (deleteDoc as Mock).mockResolvedValueOnce(undefined);
      (doc as Mock).mockReturnValue({});

      await TransactionService.deleteTransaction(mockEventId, mockTransactionId);

      expect(deleteDoc).toHaveBeenCalledWith({});
      expect(doc).toHaveBeenCalledWith(
        {},
        'events',
        mockEventId,
        'transactions',
        mockTransactionId
      );
    });

    it('should throw an error if Firebase call fails', async () => {
      (deleteDoc as Mock).mockRejectedValueOnce(
        new FirebaseError('permission-denied', 'Permission denied')
      );
      (doc as Mock).mockReturnValue({});

      await expect(
        TransactionService.deleteTransaction(mockEventId, mockTransactionId)
      ).rejects.toThrow('Firebase Error: Permission denied');
    });

    it('should throw a generic error if other error occurs', async () => {
      (deleteDoc as Mock).mockRejectedValueOnce(new Error('Generic error'));
      (doc as Mock).mockReturnValue({});

      await expect(
        TransactionService.deleteTransaction(mockEventId, mockTransactionId)
      ).rejects.toThrow('Failed to delete transaction: Generic error');
    });
  });

  // Test getTransactionsByEventId
  describe('getTransactionsByEventId', () => {
    it('should return all transactions for an event', async () => {
      (getDocs as Mock).mockResolvedValueOnce({
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
      (collection as Mock).mockReturnValue({});

      const result = await TransactionService.getTransactionsByEventId(mockEventId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockExpenseTransaction);
      expect(result[1]).toEqual(mockTransferTransaction);
      expect(getDocs).toHaveBeenCalled();
      expect(query).toHaveBeenCalled();
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('should throw an error if Firebase call fails', async () => {
      (getDocs as Mock).mockRejectedValueOnce(
        new FirebaseError('permission-denied', 'Permission denied')
      );
      (collection as Mock).mockReturnValue({});

      await expect(TransactionService.getTransactionsByEventId(mockEventId)).rejects.toThrow(
        'Firebase Error: Permission denied'
      );
    });

    it('should throw a generic error if other error occurs', async () => {
      (getDocs as Mock).mockRejectedValueOnce(new Error('Generic error'));
      (collection as Mock).mockReturnValue({});

      await expect(TransactionService.getTransactionsByEventId(mockEventId)).rejects.toThrow(
        'Failed to get transactions by event ID: Generic error'
      );
    });
  });
});
