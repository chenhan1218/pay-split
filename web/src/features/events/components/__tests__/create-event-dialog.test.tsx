import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventService } from '@/services/event-service';
import { CreateEventDialog } from '../create-event-dialog';

// Mock the services and router
vi.mock('@/services/event-service', () => ({
  EventService: {
    createEvent: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('CreateEventDialog', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  it('renders the trigger button', () => {
    render(<CreateEventDialog />);
    expect(screen.getByText(/Create New Event/i)).toBeInTheDocument();
  });

  it('opens the dialog when clicked', async () => {
    render(<CreateEventDialog />);
    fireEvent.click(screen.getByText(/Create New Event/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Create New Event/i, { selector: 'h2' })).toBeInTheDocument();
  });

  it('validates the form fields', async () => {
    render(<CreateEventDialog />);
    fireEvent.click(screen.getByText(/Create New Event/i));

    // Clear default name "You" for first participant to trigger error if needed
    // Actually our schema says min 1 participant, and we have one default.
    // Let's try to submit with an empty event name.
    fireEvent.click(screen.getByText(/Create Event/i, { selector: 'button[type="submit"]' }));

    await waitFor(() => {
      expect(screen.getByText(/Event name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('submits correctly and navigates to the event page', async () => {
    (EventService.createEvent as any).mockResolvedValueOnce({ id: 'new-id' });

    render(<CreateEventDialog />);
    fireEvent.click(screen.getByText(/Create New Event/i));

    fireEvent.change(screen.getByPlaceholderText(/Tokyo Trip 2025/i), {
      target: { value: 'Japan Trip' },
    });

    fireEvent.click(screen.getByText(/Create Event/i, { selector: 'button[type="submit"]' }));

    await waitFor(() => {
      expect(EventService.createEvent).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/events/new-id');
    });
  });
});
