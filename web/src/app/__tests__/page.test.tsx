import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '../page';
import { EventService } from '@/services/event-service';

// Mock the EventService
vi.mock('@/services/event-service', () => ({
  EventService: {
    getAllEvents: vi.fn(),
  },
}));

// Mock the CreateEventDialog component to avoid rendering issues and isolate the Home component test
// Update the mock path to the new location
vi.mock('@/features/events/components/create-event-dialog', () => ({
  CreateEventDialog: () => <div data-testid="create-event-dialog">Create Event Dialog</div>,
}));

// Mock Next.js Link component
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
      status: 'active',
      ownerId: 'owner1',
    },
    {
      id: 'event2',
      name: 'Test Event 2',
      participants: [{ id: 'p3', name: 'User 3' }],
      currency: 'EUR',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
      ownerId: 'owner1',
    },
  ];

  it('renders the list of events when events exist', async () => {
    vi.mocked(EventService.getAllEvents).mockResolvedValue(mockEvents);

    const jsx = await Home();
    render(jsx);

    expect(screen.getByText('Test Event 1')).toBeDefined();
    expect(screen.getByText('Test Event 2')).toBeDefined();
    expect(screen.getByText(/2 participants/)).toBeDefined();
    expect(screen.getByText(/1 participants/)).toBeDefined();
  });

  it('renders empty state when no events exist', async () => {
    vi.mocked(EventService.getAllEvents).mockResolvedValue([]);

    const jsx = await Home();
    render(jsx);

    expect(screen.getByText('No events created yet')).toBeDefined();
  });

  it('calls EventService.getAllEvents', async () => {
    vi.mocked(EventService.getAllEvents).mockResolvedValue([]);
    await Home();
    expect(EventService.getAllEvents).toHaveBeenCalled();
  });
});
