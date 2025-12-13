import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventService } from '../event-service';
import { doc } from 'firebase/firestore';

// Mock Firebase Firestore functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db, collection, id) => {
    if (id === undefined) {
      // Simulate Firebase SDK behavior when path segment is undefined
      // In the real SDK, it performs string operations that might fail
      // However, usually it throws a clear error, but the user reported "Cannot read properties of undefined (reading 'indexOf')"
      // This suggests some internal validation in the SDK or a polyfill is failing on undefined.
      // Let's assume for this reproduction that accessing it causes the error.
      // But wait, if I can't reproduce "reading indexOf" exactly without the real SDK, I should at least show that undefined causes issues.
      // The user error specifically said "reading indexOf".
      // This often happens in code like `path.indexOf('/')` where path is undefined.
      // Let's simulate that behavior here to match the report.
      throw new TypeError("Cannot read properties of undefined (reading 'indexOf')");
    }
    return {};
  }),
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

describe('Reproduction of Issue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw a clear error when eventId is undefined passed to getEventById', async () => {
    // We expect this to fail with a clear error message now
    await expect(EventService.getEventById(undefined as unknown as string)).rejects.toThrow(
      'Failed to get event: Event ID is required to get an event.'
    );
  });
});
