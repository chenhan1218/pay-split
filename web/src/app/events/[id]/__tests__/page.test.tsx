import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EventDetailPage from '../page';
import { EventService } from '@/services/event-service';
import { TransactionService } from '@/services/transaction-service';
import { Event } from '@/features/events/schemas';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

// Mock dependencies
vi.mock('@/services/event-service');
vi.mock('@/services/transaction-service');
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));
vi.mock('@/components/add-transaction-dialog', () => ({
  AddTransactionDialog: () => <button>Add Transaction</button>,
}));

describe('EventDetailPage', () => {
  const mockEvent: Event = {
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
    status: 'active',
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
    expect(screen.getByText('Test Event')).toBeDefined();
    expect(screen.getByText('USD')).toBeDefined();
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();

    // Verify Transactions
    expect(screen.getByText('Lunch')).toBeDefined();
    expect(screen.getByText('USD 50.00')).toBeDefined();
    expect(screen.getAllByText(/EXPENSE/)).toHaveLength(2);
    expect(screen.getByText(/Paid by: Alice/)).toBeDefined();
    expect(screen.getAllByText(/Split among: Alice, Bob/)).toHaveLength(2);
    expect(screen.getByText(/Note: Delicious tacos/)).toBeDefined();

    expect(screen.getByText('Taxi')).toBeDefined();
    expect(screen.getByText('USD 20.00')).toBeDefined();
  });

  it('renders "No transactions" message when there are no transactions', async () => {
    (EventService.getEventById as Mock).mockResolvedValue(mockEvent);
    (TransactionService.getTransactionsByEventId as Mock).mockResolvedValue([]);

    const jsx = await EventDetailPage({ params });
    render(jsx);

    expect(screen.getByText('No transactions yet. Add one above!')).toBeDefined();
  });

  it('calls notFound when event is not found', async () => {
    (EventService.getEventById as Mock).mockResolvedValue(null);
    (TransactionService.getTransactionsByEventId as Mock).mockResolvedValue([]);

    const jsx = await EventDetailPage({ params });
    render(jsx);

    expect(notFound).toHaveBeenCalled();
  });
});
