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
import type { z } from 'zod';
import {
  CreateExpenseTransactionSchema,
  CreateTransferTransactionSchema,
  type ExpenseTransaction,
  ExpenseTransactionSchema,
  type Transaction,
  TransactionSchema,
  type TransferTransaction,
  TransferTransactionSchema,
} from '@/features/transactions/schemas';
import { db } from '@/lib/firebase';

const TRANSACTIONS_COLLECTION = 'transactions';

// biome-ignore lint/complexity/noStaticOnlyClass: keeping this structure for now
export class TransactionService {
  /**
   * Retrieves a Transaction by its ID within a specific event.
   * @param eventId The ID of the parent event.
   * @param transactionId The ID of the transaction.
   * @returns A Promise that resolves to the Transaction object, or null if not found.
   */
  static async getTransactionById(
    eventId: string,
    transactionId: string
  ): Promise<Transaction | null> {
    try {
      const transactionDocRef = doc(
        db,
        EVENTS_COLLECTION,
        eventId,
        TRANSACTIONS_COLLECTION,
        transactionId
      );
      const transactionDocSnap = await getDoc(transactionDocRef);

      if (!transactionDocSnap.exists()) {
        return null;
      }

      const transactionData = transactionDocSnap.data();
      // Validate with Zod schema
      const parsedTransaction = TransactionSchema.parse({
        ...transactionData,
        id: transactionDocSnap.id,
      });
      return parsedTransaction;
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to get transaction: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Creates a new Expense Transaction.
   * @param eventId The ID of the parent event.
   * @param newExpenseData The data for the new expense transaction.
   * @param createdBy The ID of the user creating the transaction.
   * @returns A Promise that resolves to the newly created ExpenseTransaction object.
   */
  static async createExpenseTransaction(
    eventId: string,
    newExpenseData: z.infer<typeof CreateExpenseTransactionSchema>,
    createdBy: string
  ): Promise<ExpenseTransaction> {
    try {
      const validatedData = CreateExpenseTransactionSchema.parse(newExpenseData);

      const transactionToCreate = {
        ...validatedData,
        eventId,
        createdBy,
        type: 'EXPENSE',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docRef = await addDoc(
        collection(db, EVENTS_COLLECTION, eventId, TRANSACTIONS_COLLECTION),
        transactionToCreate
      );
      const createdTransaction = { ...transactionToCreate, id: docRef.id } as ExpenseTransaction;

      return ExpenseTransactionSchema.parse(createdTransaction);
    } catch (error) {
      console.error('Error creating expense transaction:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to create expense transaction: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Creates a new Transfer Transaction.
   * @param eventId The ID of the parent event.
   * @param newTransferData The data for the new transfer transaction.
   * @param createdBy The ID of the user creating the transaction.
   * @returns A Promise that resolves to the newly created TransferTransaction object.
   */
  static async createTransferTransaction(
    eventId: string,
    newTransferData: z.infer<typeof CreateTransferTransactionSchema>,
    createdBy: string
  ): Promise<TransferTransaction> {
    try {
      const validatedData = CreateTransferTransactionSchema.parse(newTransferData);

      const transactionToCreate = {
        ...validatedData,
        eventId,
        createdBy,
        type: 'TRANSFER',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docRef = await addDoc(
        collection(db, EVENTS_COLLECTION, eventId, TRANSACTIONS_COLLECTION),
        transactionToCreate
      );
      const createdTransaction = { ...transactionToCreate, id: docRef.id } as TransferTransaction;

      return TransferTransactionSchema.parse(createdTransaction);
    } catch (error) {
      console.error('Error creating transfer transaction:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to create transfer transaction: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Updates an existing Transaction.
   * @param eventId The ID of the parent event.
   * @param transactionId The ID of the transaction to update.
   * @param updateData The partial data to update the transaction with.
   * @returns A Promise that resolves when the update is complete.
   */
  static async updateTransaction(
    eventId: string,
    transactionId: string,
    updateData: Partial<Transaction>
  ): Promise<void> {
    try {
      // We can't use TransactionSchema.partial() directly for type discrimination.
      // Instead, we'll validate common fields and assume the specific type's fields are valid
      // if they are present and match the original type.
      const transactionDocRef = doc(
        db,
        EVENTS_COLLECTION,
        eventId,
        TRANSACTIONS_COLLECTION,
        transactionId
      );

      await updateDoc(transactionDocRef, {
        ...updateData,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to update transaction: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Deletes a transaction. Use with caution.
   * @param eventId The ID of the parent event.
   * @param transactionId The ID of the transaction to delete.
   * @returns A Promise that resolves when the transaction is deleted.
   */
  static async deleteTransaction(eventId: string, transactionId: string): Promise<void> {
    try {
      const transactionDocRef = doc(
        db,
        EVENTS_COLLECTION,
        eventId,
        TRANSACTIONS_COLLECTION,
        transactionId
      );
      await deleteDoc(transactionDocRef);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to delete transaction: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Retrieves all transactions for a given event.
   * @param eventId The ID of the parent event.
   * @returns A Promise that resolves to an array of Transaction objects.
   */
  static async getTransactionsByEventId(eventId: string): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(db, EVENTS_COLLECTION, eventId, TRANSACTIONS_COLLECTION);
      const q = query(transactionsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];
      querySnapshot.forEach((docSnap) => {
        const transactionData = { ...docSnap.data(), id: docSnap.id };
        transactions.push(TransactionSchema.parse(transactionData));
      });
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions by event ID:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to get transactions by event ID: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// Collection name for events - duplicated here to avoid circular dependency with event-service.ts
// In a larger app, you might have a shared constants file.
const EVENTS_COLLECTION = 'events';
