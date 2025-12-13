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
vi.mock('@/components/create-event-dialog', () => ({
  CreateEventDialog: () => <div data-testid="create-event-dialog">Create Event Dialog</div>,
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock UI components if necessary, but here we can rely on shallow rendering or just mocking them if they are complex.
// For now, let's assume they are simple enough or we want to test integration.
// However, Card components are imported. If they are just divs, it's fine.

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
    // Setup the mock return value
    vi.mocked(EventService.getAllEvents).mockResolvedValue(mockEvents);

    // Render the async component
    // Note: React Testing Library does not strictly support async server components yet in the standard way for unit tests without some setup.
    // However, for unit testing an async component logic, we can often treat it as a function if we are not testing the full Next.js routing integration.
    // But since it's a React component, we usually mock the data fetching or use a wrapper.
    // Given Home is `export default async function Home()`, we need to handle it.

    // We can await the component function directly to get the JSX, then render it.
    const jsx = await Home();
    render(jsx);

    // Check if event names are present
    expect(screen.getByText('Test Event 1')).toBeDefined();
    expect(screen.getByText('Test Event 2')).toBeDefined();

    // Check if participant counts are correct
    expect(screen.getByText(/2 participants/)).toBeDefined();
    expect(screen.getByText(/1 participants/)).toBeDefined();
  });

  it('renders empty state when no events exist', async () => {
    vi.mocked(EventService.getAllEvents).mockResolvedValue([]);

    const jsx = await Home();
    render(jsx);

    expect(screen.getByText('No events created yet. Start by creating a new event!')).toBeDefined();
  });

  it('calls EventService.getAllEvents', async () => {
    vi.mocked(EventService.getAllEvents).mockResolvedValue([]);
    await Home();
    expect(EventService.getAllEvents).toHaveBeenCalled();
  });
});
