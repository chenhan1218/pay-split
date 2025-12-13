import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventService } from '../event-service';
import { EventSchema } from '../../features/events/schemas';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';

// Mock Firebase Firestore functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(() => {
    // Marked _queryConstraints as unused
    return {};
  }),
  where: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
}));

// Mock the firebase.ts module to export a mock db object
vi.mock('../../lib/firebase', () => ({
  db: {}, // Mock db object, as its specific methods are mocked in firebase/firestore
}));

const mockEvent = {
  id: 'event123',
  name: 'Test Event',
  status: 'active',
  currency: 'TWD',
  ownerId: 'user123',
  participants: [
    { id: 'part1', name: 'Alice', avatarUrl: null, linkedUserId: 'user123' },
    { id: 'part2', name: 'Bob', avatarUrl: null, linkedUserId: null },
  ],
  createdAt: 1678886400000,
  updatedAt: 1678886400000,
};

const mockCreateEventData = {
  name: 'New Event',
  currency: 'USD',
  participants: [{ name: 'Charlie' }, { name: 'David' }],
};

describe('EventService', () => {
  let service: EventService;

  beforeEach(() => {
    service = new EventService();
    vi.clearAllMocks(); // Clear mocks before each test
  });

  // Test getEventById
  describe('getEventById', () => {
    it('should return an event if found', async () => {
      // Mock getDoc to return an existing document
      (getDoc as vi.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ ...mockEvent, id: undefined }), // Firebase data usually doesn't include the ID
        id: mockEvent.id,
      });
      (doc as vi.Mock).mockReturnValue({}); // Mock doc function return value

      const result = await service.getEventById(mockEvent.id);
      expect(result).toEqual(mockEvent);
      expect(getDoc).toHaveBeenCalledWith({});
      expect(doc).toHaveBeenCalledWith({}, 'events', mockEvent.id);
      EventSchema.parse(result); // Ensure Zod validation passes
    });

    it('should return null if event not found', async () => {
      // Mock getDoc to return a non-existing document
      (getDoc as vi.Mock).mockResolvedValueOnce({
        exists: () => false,
        data: () => undefined,
      });
      (doc as vi.Mock).mockReturnValue({});

      const result = await service.getEventById('nonexistent-id');
      expect(result).toBeNull();
    });

    it('should throw an error if Firebase call fails', async () => {
      const firebaseError = new Error('Firebase network error');
      (getDoc as vi.Mock).mockRejectedValueOnce(firebaseError);
      (doc as vi.Mock).mockReturnValue({});

      await expect(service.getEventById(mockEvent.id)).rejects.toThrow('Failed to get event');
    });
  });

  // Test createEvent
  describe('createEvent', () => {
    it('should create a new event and return it', async () => {
      const mockDocRef = { id: 'new-event-id' };
      (addDoc as vi.Mock).mockResolvedValueOnce(mockDocRef);
      (collection as vi.Mock).mockReturnValue({}); // Mock collection reference
      (doc as vi.Mock).mockReturnValue({ id: 'mock-participant-id' }); // Mock for participant ID generation

      const result = await service.createEvent(mockCreateEventData, 'creator123');

      expect(addDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          name: mockCreateEventData.name,
          currency: mockCreateEventData.currency,
          ownerId: 'creator123',
          status: 'active',
          participants: expect.arrayContaining([
            expect.objectContaining({
              name: 'Charlie',
              id: expect.any(String),
              linkedUserId: null,
            }),
            expect.objectContaining({ name: 'David', id: expect.any(String), linkedUserId: null }),
          ]),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        })
      );

      expect(result).toEqual(
        expect.objectContaining({
          ...mockCreateEventData,
          id: mockDocRef.id,
          ownerId: 'creator123',
          status: 'active',
          participants: expect.arrayContaining([
            expect.objectContaining({
              name: 'Charlie',
              id: expect.any(String),
              linkedUserId: null,
            }),
            expect.objectContaining({ name: 'David', id: expect.any(String), linkedUserId: null }),
          ]),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        })
      );
      EventSchema.parse(result); // Ensure Zod validation passes
    });

    it('should throw an error if Zod validation fails for newEventData', async () => {
      const invalidData = { ...mockCreateEventData, name: '' }; // Invalid name
      await expect(service.createEvent(invalidData, 'creator123')).rejects.toThrow(
        /Event name cannot be empty/
      );
    });

    it('should throw an error if Firebase call fails', async () => {
      const firebaseError = new Error('Firebase permission denied');
      (addDoc as vi.Mock).mockRejectedValueOnce(firebaseError);
      (collection as vi.Mock).mockReturnValue({});
      (doc as vi.Mock).mockReturnValue({ id: 'mock-participant-id' });

      await expect(service.createEvent(mockCreateEventData, 'creator123')).rejects.toThrow(
        'Failed to create event'
      );
    });
  });

  // Test updateEvent
  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      (updateDoc as vi.Mock).mockResolvedValueOnce(undefined);
      (doc as vi.Mock).mockReturnValue({});

      const updateData = { name: 'Updated Event Name' };
      await service.updateEvent(mockEvent.id, updateData);

      expect(updateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          name: 'Updated Event Name',
          updatedAt: expect.any(Number),
        })
      );
      expect(doc).toHaveBeenCalledWith({}, 'events', mockEvent.id);
    });

    it('should throw an error if Zod validation fails for updateData', async () => {
      const invalidUpdateData = { currency: 'INVALID' }; // Invalid currency length
      await expect(service.updateEvent(mockEvent.id, invalidUpdateData)).rejects.toThrow(
        /Currency must be a 3-letter ISO code/
      );
    });

    it('should throw an error if Firebase call fails', async () => {
      const firebaseError = new Error('Firebase update error');
      (updateDoc as vi.Mock).mockRejectedValueOnce(firebaseError);
      (doc as vi.Mock).mockReturnValue({});

      const updateData = { name: 'Updated Event Name' };
      await expect(service.updateEvent(mockEvent.id, updateData)).rejects.toThrow(
        'Failed to update event'
      );
    });
  });

  // Test archiveEvent
  describe('archiveEvent', () => {
    it('should archive an event by updating its status', async () => {
      (updateDoc as vi.Mock).mockResolvedValueOnce(undefined);
      (doc as vi.Mock).mockReturnValue({});

      await service.archiveEvent(mockEvent.id);

      expect(updateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          status: 'archived',
          updatedAt: expect.any(Number),
        })
      );
      expect(doc).toHaveBeenCalledWith({}, 'events', mockEvent.id);
    });
  });

  // Test deleteEvent
  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      (deleteDoc as vi.Mock).mockResolvedValueOnce(undefined);
      (doc as vi.Mock).mockReturnValue({});

      await service.deleteEvent(mockEvent.id);

      expect(deleteDoc).toHaveBeenCalledWith({});
      expect(doc).toHaveBeenCalledWith({}, 'events', mockEvent.id);
    });

    it('should throw an error if Firebase call fails', async () => {
      const firebaseError = new Error('Firebase delete error');
      (deleteDoc as vi.Mock).mockRejectedValueOnce(firebaseError);
      (doc as vi.Mock).mockReturnValue({});

      await expect(service.deleteEvent(mockEvent.id)).rejects.toThrow('Failed to delete event');
    });
  });

  // Test getEventsByUserId
  describe('getEventsByUserId', () => {
    it('should return a list of events for a given user ID', async () => {
      (getDocs as vi.Mock).mockResolvedValueOnce({
        forEach: (callback: (docSnap: { data: () => unknown; id: string }) => void) => {
          callback({
            data: () => ({ ...mockEvent, id: undefined }),
            id: mockEvent.id,
          });
        },
      });
      (collection as vi.Mock).mockReturnValue({});
      (query as vi.Mock).mockReturnValue({});
      (where as vi.Mock).mockReturnValue({});
      (orderBy as vi.Mock).mockReturnValue({});

      const result = await service.getEventsByUserId('user123');

      expect(result).toEqual([mockEvent]);
      expect(getDocs).toHaveBeenCalledWith({});
      expect(query).toHaveBeenCalledWith({}, expect.anything(), expect.anything());
      expect(where).toHaveBeenCalledWith('participants', 'array-contains', {
        linkedUserId: 'user123',
      });
      expect(orderBy).toHaveBeenCalledWith('updatedAt', 'desc');
      EventSchema.parse(result[0]); // Ensure Zod validation passes
    });

    it('should return an empty array if no events found for user ID', async () => {
      (getDocs as vi.Mock).mockResolvedValueOnce({
        forEach: (callback: (docSnap: { data: () => unknown; id: string }) => void) => {},
      });
      (collection as vi.Mock).mockReturnValue({});
      (query as vi.Mock).mockReturnValue({});
      (where as vi.Mock).mockReturnValue({});
      (orderBy as vi.Mock).mockReturnValue({});

      const result = await service.getEventsByUserId('nonexistent-user');
      expect(result).toEqual([]);
    });

    it('should throw an error if Firebase call fails', async () => {
      const firebaseError = new Error('Firebase query error');
      (getDocs as vi.Mock).mockRejectedValueOnce(firebaseError);
      (collection as vi.Mock).mockReturnValue({});
      (query as vi.Mock).mockReturnValue({});
      (where as vi.Mock).mockReturnValue({});
      (orderBy as vi.Mock).mockReturnValue({});

      await expect(service.getEventsByUserId('user123')).rejects.toThrow(
        'Failed to get events by user ID'
      );
    });
  });

  // Test getEventsByOwnerId
  describe('getEventsByOwnerId', () => {
    it('should return a list of events for a given owner ID', async () => {
      (getDocs as vi.Mock).mockResolvedValueOnce({
        forEach: (callback: (docSnap: { data: () => unknown; id: string }) => void) => {
          callback({
            data: () => ({ ...mockEvent, id: undefined }),
            id: mockEvent.id,
          });
        },
      });
      (collection as vi.Mock).mockReturnValue({});
      (query as vi.Mock).mockReturnValue({});
      (where as vi.Mock).mockReturnValue({});
      (orderBy as vi.Mock).mockReturnValue({});

      const result = await service.getEventsByOwnerId('user123');

      expect(result).toEqual([mockEvent]);
      expect(getDocs).toHaveBeenCalledWith({});
      expect(query).toHaveBeenCalledWith({}, expect.anything(), expect.anything());
      expect(where).toHaveBeenCalledWith('ownerId', '==', 'user123');
      expect(orderBy).toHaveBeenCalledWith('updatedAt', 'desc');
      EventSchema.parse(result[0]); // Ensure Zod validation passes
    });

    it('should return an empty array if no events found for owner ID', async () => {
      (getDocs as vi.Mock).mockResolvedValueOnce({
        forEach: (callback: (docSnap: { data: () => unknown; id: string }) => void) => {},
      });
      (collection as vi.Mock).mockReturnValue({});
      (query as vi.Mock).mockReturnValue({});
      (where as vi.Mock).mockReturnValue({});
      (orderBy as vi.Mock).mockReturnValue({});

      const result = await service.getEventsByOwnerId('nonexistent-owner');
      expect(result).toEqual([]);
    });

    it('should throw an error if Firebase call fails', async () => {
      const firebaseError = new Error('Firebase query error');
      (getDocs as vi.Mock).mockRejectedValueOnce(firebaseError);
      (collection as vi.Mock).mockReturnValue({});
      (query as vi.Mock).mockReturnValue({});
      (where as vi.Mock).mockReturnValue({});
      (orderBy as vi.Mock).mockReturnValue({});

      await expect(service.getEventsByOwnerId('user123')).rejects.toThrow(
        'Failed to get events by owner ID'
      );
    });
  });
});
