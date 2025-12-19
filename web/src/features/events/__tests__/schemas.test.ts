import { describe, expect, it } from 'vitest';
import { CreateEventSchema, EventSchema } from '../schemas';

describe('EventSchema', () => {
  const validEvent = {
    id: 'event-123',
    name: 'Trip to Japan',
    status: 'active',
    currency: 'JPY',
    ownerId: 'user-1',
    participants: [
      { id: 'p1', name: 'Alice', linkedUserId: 'user-1' },
      { id: 'p2', name: 'Bob' },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it('validates a correct event', () => {
    const result = EventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('fails if name is empty', () => {
    const invalid = { ...validEvent, name: '' };
    const result = EventSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails if currency is not 3 characters', () => {
    const invalid = { ...validEvent, currency: 'US' };
    const result = EventSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails if participants array is empty', () => {
    const invalid = { ...validEvent, participants: [] };
    const result = EventSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('CreateEventSchema', () => {
  const validCreateEvent = {
    name: 'Dinner',
    currency: 'USD',
    participants: [{ name: 'Alice' }, { name: 'Bob' }],
  };

  it('validates a correct create event payload', () => {
    const result = CreateEventSchema.safeParse(validCreateEvent);
    expect(result.success).toBe(true);
  });
});
