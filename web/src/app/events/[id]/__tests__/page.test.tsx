import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { EventService } from '@/services/event-service';
import { TransactionService } from '@/services/transaction-service';
import EventDetailPage from '../page';

// Mock services
vi.mock('@/services/event-service');
vi.mock('@/services/transaction-service');

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock AddTransactionDialog
vi.mock('@/features/transactions/components/add-transaction-dialog', () => ({
  AddTransactionDialog: () => <button type="button">Add Transaction</button>,
}));

// Mock config to avoid env validation error during tests
vi.mock('@/config/env', () => ({
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test-auth-domain',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project-id',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test-storage-bucket',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test-sender-id',
    NEXT_PUBLIC_FIREBASE_APP_ID: 'test-app-id',
  },
}));

describe('EventDetailPage', () => {
  const mockEvent = {
    id: 'event-1',
    name: 'Test Event',
    currency: 'USD',
    participants: [
      { id: 'p1', name: 'Alice', linkedUserId: null },
      { id: 'p2', name: 'Bob', linkedUserId: null },
    ],
    ownerId: 'owner-1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'active' as const,
  };

  const mockTransactions = [
    {
      id: 'txn-1',
      title: 'Lunch',
      amount: 50.0,
      currency: 'USD',
      date: Date.now(),
      type: 'EXPENSE',
      paidBy: { p1: 50.0 },
      splitDetails: { p1: 25.0, p2: 25.0 },
      note: 'Delicious tacos',
    },
    {
      id: 'txn-2',
      title: 'Taxi',
      amount: 20.0,
      currency: 'USD',
      date: Date.now(),
      type: 'EXPENSE',
      paidBy: { p2: 20.0 },
      splitDetails: { p1: 10.0, p2: 10.0 },
    },
  ];

  const params = Promise.resolve({ id: 'event-1' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders event details and transactions correctly', async () => {
    (EventService.getEventById as Mock).mockResolvedValue(mockEvent);
    (TransactionService.getTransactionsByEventId as Mock).mockResolvedValue(mockTransactions);

    const jsx = await EventDetailPage({ params });
    render(jsx);

    // Verify Event Details
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getAllByText('USD').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0);

    // Verify Transactions
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getAllByText(/50\.00/).length).toBeGreaterThan(0);

    // Check for note
    expect(screen.getByText('Delicious tacos')).toBeInTheDocument();

    expect(screen.getByText('Taxi')).toBeInTheDocument();
    expect(screen.getAllByText(/20\.00/).length).toBeGreaterThan(0);
  });

  it('renders "No transactions" message when there are no transactions', async () => {
    (EventService.getEventById as Mock).mockResolvedValue(mockEvent);
    (TransactionService.getTransactionsByEventId as Mock).mockResolvedValue([]);

    const jsx = await EventDetailPage({ params });
    render(jsx);

    expect(screen.getByText(/No transactions yet/)).toBeInTheDocument();
  });

  it('calls notFound when event is not found', async () => {
    (EventService.getEventById as Mock).mockResolvedValue(null);
    (TransactionService.getTransactionsByEventId as Mock).mockResolvedValue([]);

    const result = await EventDetailPage({ params });

    expect(notFound).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
