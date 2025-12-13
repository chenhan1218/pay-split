import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EventDetailPage from '../page';
import { EventService } from '@/services/event-service';
import { TransactionService } from '@/services/transaction-service';
import { notFound } from 'next/navigation';

// Mock dependencies
vi.mock('@/services/event-service', () => ({
  EventService: {
    getEventById: vi.fn(),
  }
}));
vi.mock('@/services/transaction-service', () => ({
  TransactionService: {
    getTransactionsByEventId: vi.fn(),
  }
}));
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock UI components to avoid rendering full tree
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

vi.mock('@/components/add-transaction-dialog', () => ({
  AddTransactionDialog: () => <button data-testid="add-transaction-btn">Add Transaction</button>,
}));

const mockEvent = {
  id: 'event1',
  name: 'Trip to Japan',
  currency: 'JPY',
  participants: [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
  ],
  ownerId: 'owner1',
  status: 'active',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('EventDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders event details correctly when event exists', async () => {
    // Mock service responses
    (EventService.getEventById as any).mockResolvedValue(mockEvent);
    (TransactionService.getTransactionsByEventId as any).mockResolvedValue([]);

    const params = Promise.resolve({ id: 'event1' });
    const jsx = await EventDetailPage({ params });
    render(jsx);

    expect(EventService.getEventById).toHaveBeenCalledWith('event1');
    expect(screen.getByText('Trip to Japan')).toBeDefined();
    expect(screen.getByText('JPY')).toBeDefined();
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
  });

  it('calls notFound when event does not exist', async () => {
    (EventService.getEventById as any).mockResolvedValue(null);
    (TransactionService.getTransactionsByEventId as any).mockResolvedValue([]);

    const params = Promise.resolve({ id: 'nonexistent' });
    try {
        await EventDetailPage({ params });
    } catch (e) {
        // next/navigation notFound() might throw internally, or we just check if it was called
    }

    expect(EventService.getEventById).toHaveBeenCalledWith('nonexistent');
    expect(notFound).toHaveBeenCalled();
  });
});
