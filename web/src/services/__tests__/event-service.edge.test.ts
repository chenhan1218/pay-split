import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventService } from '../event-service';
import { doc } from 'firebase/firestore';

// Mock Firebase Firestore functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
}));

// Mock the firebase.ts module
vi.mock('../../lib/firebase', () => ({
  db: {},
}));

describe('EventService Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw a clear error when eventId is empty string passed to getEventById', async () => {
    await expect(EventService.getEventById(''))
      .rejects
      .toThrow("Failed to get event: Event ID is required to get an event.");
  });

  it('should throw a clear error when eventId is undefined passed to getEventById', async () => {
      // @ts-ignore
    await expect(EventService.getEventById(undefined))
      .rejects
      .toThrow("Failed to get event: Event ID is required to get an event.");
  });
});
