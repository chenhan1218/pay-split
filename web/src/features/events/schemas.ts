import { z } from 'zod';

// Participant Schema
export const ParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().url().optional().nullable(),
  linkedUserId: z.string().optional().nullable(),
});

export type Participant = z.infer<typeof ParticipantSchema>;

// Event Schema
export const EventSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Event name cannot be empty'),
  status: z.enum(['active', 'archived']),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code'),
  ownerId: z.string(),
  participants: z.array(ParticipantSchema).min(1, 'Event must have at least one participant'),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Event = z.infer<typeof EventSchema>;

// Optional: Schema for creating a new Event (excluding generated fields)
export const CreateEventSchema = EventSchema.omit({
  id: true,
  status: true,
  ownerId: true, // Will be set by auth
  createdAt: true,
  updatedAt: true,
}).extend({
  participants: z
    .array(ParticipantSchema.omit({ id: true, linkedUserId: true }))
    .min(1, 'Event must have at least one participant'), // participant ID will be generated
});

export type CreateEvent = z.infer<typeof CreateEventSchema>;

// Optional: Schema for updating an existing Event
export const UpdateEventSchema = EventSchema.partial(); // Allow partial updates
