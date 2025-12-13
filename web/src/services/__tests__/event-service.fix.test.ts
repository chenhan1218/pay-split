import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { EventService } from '../event-service';
import { addDoc, collection, doc } from 'firebase/firestore';

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

const mockCreateEventData = {
  name: 'New Event',
  currency: 'USD',
  participants: [{ name: 'Charlie' }, { name: 'David' }],
};

describe('EventService Fix Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should throw a descriptive error if ownerId is undefined (Runtime Check)', async () => {
      // We cast to any to simulate a runtime call where types might be bypassed or inferred incorrectly
      // @ts-expect-error Testing runtime validation for undefined ownerId
      await expect(EventService.createEvent(mockCreateEventData, undefined)).rejects.toThrow(
        'Owner ID is required to create an event.'
      );
    });

    it('should throw a descriptive error if ownerId is an empty string', async () => {
      await expect(EventService.createEvent(mockCreateEventData, '')).rejects.toThrow(
        'Owner ID is required to create an event.'
      );
    });

    it('should NOT call addDoc when ownerId is missing', async () => {
      const mockDocRef = { id: 'new-event-id' };
      (addDoc as Mock).mockResolvedValueOnce(mockDocRef);
      (collection as Mock).mockReturnValue({});
      (doc as Mock).mockReturnValue({ id: 'mock-participant-id' });

      try {
        // @ts-expect-error Testing runtime validation for undefined ownerId
        await EventService.createEvent(mockCreateEventData, undefined);
      } catch {
        // Expected error
      }

      expect(addDoc).not.toHaveBeenCalled();
    });

    it('should successfully create event when ownerId is provided', async () => {
      const mockDocRef = { id: 'new-event-id' };
      (addDoc as Mock).mockResolvedValueOnce(mockDocRef);
      (collection as Mock).mockReturnValue({});
      (doc as Mock).mockReturnValue({ id: 'mock-participant-id' });

      const validOwnerId = 'user-123';
      const result = await EventService.createEvent(mockCreateEventData, validOwnerId);

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ownerId: validOwnerId,
          name: mockCreateEventData.name,
        })
      );
      expect(result.ownerId).toBe(validOwnerId);
    });
  });
});
