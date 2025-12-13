import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import {
  Event,
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
  Participant,
} from '@/features/events/schemas';
import { FirebaseError } from 'firebase/app'; // Import FirebaseError for specific error handling

const EVENTS_COLLECTION = 'events';

export class EventService {
  /**
   * Retrieves an Event by its ID.
   * @param eventId The ID of the event.
   * @returns A Promise that resolves to the Event object, or null if not found.
   */
  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      const eventDocRef = doc(db, EVENTS_COLLECTION, eventId);
      const eventDocSnap = await getDoc(eventDocRef);

      if (!eventDocSnap.exists()) {
        return null;
      }

      const eventData = eventDocSnap.data();
      // Validate with Zod schema
      const parsedEvent = EventSchema.parse({ ...eventData, id: eventDocSnap.id });
      return parsedEvent;
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      if (error instanceof FirebaseError) {
        // Handle specific Firebase errors if needed
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to get event: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Retrieves all events.
   * @returns A Promise that resolves to an array of all Event objects.
   */
  static async getAllEvents(): Promise<Event[]> {
    try {
      const eventsRef = collection(db, EVENTS_COLLECTION);
      const q = query(eventsRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const events: Event[] = [];
      querySnapshot.forEach((docSnap) => {
        const eventData = { ...docSnap.data(), id: docSnap.id };
        events.push(EventSchema.parse(eventData));
      });
      return events;
    } catch (error) {
      console.error('Error fetching all events:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to get all events: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Creates a new Event.
   * @param newEventData The data for the new event.
   * @param ownerId The ID of the user creating the event.
   * @returns A Promise that resolves to the newly created Event object.
   */
  static async createEvent(
    newEventData: Omit<CreateEventSchema, 'ownerId'>,
    ownerId: string
  ): Promise<Event> {
    try {
      // Validate incoming data
      const validatedData = CreateEventSchema.parse({ ...newEventData, ownerId });

      const participantsWithIds = validatedData.participants.map(
        (p: Omit<Participant, 'id' | 'linkedUserId'>) => ({
          ...p,
          id: doc(collection(db, '_')).id, // Generate a unique ID for each participant
          linkedUserId: p.linkedUserId || null,
        })
      );

      const eventToCreate = {
        ...validatedData,
        ownerId,
        participants: participantsWithIds,
        status: 'active', // Default status
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventToCreate);
      const createdEvent = { ...eventToCreate, id: docRef.id } as Event; // Cast to Event type

      // Validate the created event against the full EventSchema
      return EventSchema.parse(createdEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to create event: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Updates an existing Event.
   * @param eventId The ID of the event to update.
   * @param updateData The partial data to update the event with.
   * @returns A Promise that resolves when the update is complete.
   */
  static async updateEvent(eventId: string, updateData: Partial<Event>): Promise<void> {
    try {
      // Validate update data against a partial schema
      const validatedData = UpdateEventSchema.parse(updateData);
      const eventDocRef = doc(db, EVENTS_COLLECTION, eventId);

      await updateDoc(eventDocRef, {
        ...validatedData,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating event:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to update event: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Archives an event by changing its status to 'archived'.
   * @param eventId The ID of the event to archive.
   * @returns A Promise that resolves when the event is archived.
   */
  static async archiveEvent(eventId: string): Promise<void> {
    await this.updateEvent(eventId, { status: 'archived' });
  }

  /**
   * Deletes an event. Use with caution.
   * @param eventId The ID of the event to delete.
   * @returns A Promise that resolves when the event is deleted.
   */
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const eventDocRef = doc(db, EVENTS_COLLECTION, eventId);
      await deleteDoc(eventDocRef);
    } catch (error) {
      console.error('Error deleting event:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to delete event: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Gets a list of events participated by a given user (owner or participant).
   * @param userId The ID of the user.
   * @returns A Promise that resolves to an array of Event objects.
   */
  static async getEventsByUserId(userId: string): Promise<Event[]> {
    try {
      const eventsRef = collection(db, EVENTS_COLLECTION);
      const q = query(
        eventsRef,
        where('participants', 'array-contains', { linkedUserId: userId }), // Assuming linkedUserId is used for participants
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const events: Event[] = [];
      querySnapshot.forEach((docSnap) => {
        const eventData = { ...docSnap.data(), id: docSnap.id };
        // Validate each event against the Zod schema
        events.push(EventSchema.parse(eventData));
      });
      return events;
    } catch (error) {
      console.error('Error fetching events by user ID:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to get events by user ID: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Gets a list of events where the given user is the owner.
   * @param ownerId The ID of the user.
   * @returns A Promise that resolves to an array of Event objects.
   */
  static async getEventsByOwnerId(ownerId: string): Promise<Event[]> {
    try {
      const eventsRef = collection(db, EVENTS_COLLECTION);
      const q = query(eventsRef, where('ownerId', '==', ownerId), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const events: Event[] = [];
      querySnapshot.forEach((docSnap) => {
        const eventData = { ...docSnap.data(), id: docSnap.id };
        events.push(EventSchema.parse(eventData));
      });
      return events;
    } catch (error) {
      console.error('Error fetching events by owner ID:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase Error: ${error.message}`);
      }
      throw new Error(
        `Failed to get events by owner ID: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
