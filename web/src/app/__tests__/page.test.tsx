import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventService } from '@/services/event-service';
import Home from '../page';

// Mock the EventService
vi.mock('@/services/event-service', () => ({
  EventService: {
    getAllEvents: vi.fn(),
    createEvent: vi.fn(),
  },
}));

// Mock the CreateEventDialog component
vi.mock('@/features/events/components/create-event-dialog', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/events/components/create-event-dialog')>();
  return {
    ...actual,
  };
});

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Home Page', () => {
  const mockEvents = [
    {
      id: 'event1',
      name: 'Test Event 1',
      participants: [
        { id: 'p1', name: 'User 1' },
        { id: 'p2', name: 'User 2' },
      ],
      currency: 'USD',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active' as const,
      ownerId: 'owner1',
    },
    {
      id: 'event2',
      name: 'Test Event 2',
      participants: [{ id: 'p3', name: 'User 3' }],
      currency: 'EUR',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active' as const,
      ownerId: 'owner1',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the list of events when events exist', async () => {
    vi.mocked(EventService.getAllEvents).mockResolvedValue(mockEvents);

    const jsx = await Home();
    render(jsx);

    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    expect(screen.getByText(/2 participants/)).toBeInTheDocument();
    expect(screen.getByText(/1 participants/)).toBeInTheDocument();
  });

  it('renders empty state when no events exist', async () => {
    vi.mocked(EventService.getAllEvents).mockResolvedValue([]);

    const jsx = await Home();
    render(jsx);

    expect(screen.getByText('No events created yet')).toBeInTheDocument();
  });

  it('calls EventService.getAllEvents', async () => {
    vi.mocked(EventService.getAllEvents).mockResolvedValue([]);
    await Home();
    expect(EventService.getAllEvents).toHaveBeenCalled();
  });
});
